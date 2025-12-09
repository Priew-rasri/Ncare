/**
 * Barcode Scanner Service
 * Supports:
 * 1. Hardware USB Scanner (Keyboard wedge mode)
 * 2. Web Barcode Detection API (experimental)
 * 3. Camera-based scanning (fallback)
 */

// Check if Barcode Detection API is available
export function isBarcodeDetectionSupported(): boolean {
  return 'BarcodeDetector' in window;
}

/**
 * Hardware Barcode Scanner Integration
 * Most USB barcode scanners work in "keyboard wedge" mode
 * They simulate keyboard input and append Enter key
 */
export class HardwareBarcodeScanner {
  private buffer: string = '';
  private timeout: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_MS = 100; // Time window for barcode input
  private readonly MIN_LENGTH = 3; // Minimum barcode length
  private callback: (barcode: string) => void;

  constructor(callback: (barcode: string) => void) {
    this.callback = callback;
    this.attachListener();
  }

  private attachListener() {
    document.addEventListener('keypress', this.handleKeyPress);
  }

  private handleKeyPress = (e: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Clear timeout if exists
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Enter key marks end of barcode
    if (e.key === 'Enter' && this.buffer.length >= this.MIN_LENGTH) {
      this.callback(this.buffer);
      this.buffer = '';
      e.preventDefault();
      return;
    }

    // Accumulate characters
    if (e.key.length === 1) {
      this.buffer += e.key;

      // Set timeout to reset buffer if input is too slow (manual typing)
      this.timeout = setTimeout(() => {
        this.buffer = '';
      }, this.TIMEOUT_MS);
    }
  };

  destroy() {
    document.removeEventListener('keypress', this.handleKeyPress);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

/**
 * Camera-based Barcode Scanner using HTML5 Barcode Detection API
 */
export class CameraBarcodeScanner {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private detector: any = null;
  private animationFrame: number | null = null;
  private callback: (barcode: string) => void;
  private isScanning: boolean = false;

  constructor(callback: (barcode: string) => void) {
    this.callback = callback;
  }

  async start(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.video = videoElement;

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      this.video.srcObject = this.stream;
      this.video.play();

      // Initialize Barcode Detector
      if (isBarcodeDetectionSupported()) {
        // @ts-ignore - Experimental API
        this.detector = new BarcodeDetector({
          formats: [
            'code_128',
            'code_39',
            'code_93',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'qr_code'
          ]
        });

        this.isScanning = true;
        this.scan();
      } else {
        throw new Error('Barcode Detection API not supported in this browser');
      }
    } catch (error) {
      console.error('Error starting camera scanner:', error);
      throw error;
    }
  }

  private scan = async () => {
    if (!this.isScanning || !this.video || !this.detector) {
      return;
    }

    try {
      const barcodes = await this.detector.detect(this.video);

      if (barcodes.length > 0) {
        const barcode = barcodes[0];
        this.callback(barcode.rawValue);
        // Stop scanning after successful detection
        this.stop();
        return;
      }
    } catch (error) {
      console.error('Error detecting barcode:', error);
    }

    // Continue scanning
    this.animationFrame = requestAnimationFrame(this.scan);
  };

  stop() {
    this.isScanning = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }
  }

  destroy() {
    this.stop();
  }
}

/**
 * Unified Barcode Scanner Manager
 */
export class BarcodeScanner {
  private hardwareScanner: HardwareBarcodeScanner | null = null;
  private cameraScanner: CameraBarcodeScanner | null = null;
  private mode: 'hardware' | 'camera' = 'hardware';

  constructor(private callback: (barcode: string) => void) {}

  /**
   * Enable hardware scanner (USB wedge mode)
   */
  enableHardwareScanner() {
    this.disableCameraScanner();
    this.hardwareScanner = new HardwareBarcodeScanner(this.callback);
    this.mode = 'hardware';
  }

  /**
   * Enable camera scanner
   */
  async enableCameraScanner(videoElement: HTMLVideoElement) {
    this.disableHardwareScanner();
    this.cameraScanner = new CameraBarcodeScanner(this.callback);
    await this.cameraScanner.start(videoElement);
    this.mode = 'camera';
  }

  /**
   * Disable hardware scanner
   */
  disableHardwareScanner() {
    if (this.hardwareScanner) {
      this.hardwareScanner.destroy();
      this.hardwareScanner = null;
    }
  }

  /**
   * Disable camera scanner
   */
  disableCameraScanner() {
    if (this.cameraScanner) {
      this.cameraScanner.destroy();
      this.cameraScanner = null;
    }
  }

  /**
   * Cleanup all scanners
   */
  destroy() {
    this.disableHardwareScanner();
    this.disableCameraScanner();
  }

  getCurrentMode() {
    return this.mode;
  }
}

export default BarcodeScanner;
