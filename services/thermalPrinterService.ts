/**
 * Thermal Printer Service
 * Supports:
 * 1. ESC/POS command protocol (80mm thermal printers)
 * 2. Network printing (IP-based)
 * 3. WebUSB (for direct USB connection)
 */

import type { SaleRecord, Settings } from '../types';

/**
 * ESC/POS Commands
 */
const ESC = '\x1B';
const GS = '\x1D';

export const ESCPOS = {
  INIT: `${ESC}@`, // Initialize printer
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  SIZE_NORMAL: `${GS}!\x00`,
  SIZE_DOUBLE: `${GS}!\x11`,
  SIZE_TRIPLE: `${GS}!\x22`,
  LINE_FEED: '\n',
  CUT: `${GS}V\x00`, // Full cut
  PARTIAL_CUT: `${GS}V\x01`,
  DRAWER_KICK: `${ESC}p\x00\x19\xFA`, // Open cash drawer
};

/**
 * Format receipt text for thermal printer (80mm paper, ~48 chars width)
 */
export function formatReceipt(sale: SaleRecord, settings: Settings): string {
  const WIDTH = 48;
  const line = (char: string = '-') => char.repeat(WIDTH);
  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((WIDTH - text.length) / 2));
    return ' '.repeat(padding) + text;
  };
  const leftRight = (left: string, right: string) => {
    const spacing = WIDTH - left.length - right.length;
    return left + ' '.repeat(Math.max(1, spacing)) + right;
  };

  let receipt = '';

  // Initialize
  receipt += ESCPOS.INIT;

  // Header
  receipt += ESCPOS.ALIGN_CENTER;
  receipt += ESCPOS.SIZE_DOUBLE;
  receipt += ESCPOS.BOLD_ON;
  receipt += center(settings.storeName) + ESCPOS.LINE_FEED;
  receipt += ESCPOS.SIZE_NORMAL;
  receipt += ESCPOS.BOLD_OFF;
  receipt += center(settings.address) + ESCPOS.LINE_FEED;
  receipt += center(`Tel: ${settings.phone}`) + ESCPOS.LINE_FEED;
  receipt += center(`Tax ID: ${settings.taxId}`) + ESCPOS.LINE_FEED;
  receipt += line() + ESCPOS.LINE_FEED;

  // Invoice Details
  receipt += ESCPOS.ALIGN_LEFT;
  receipt += leftRight(`Invoice: ${sale.id}`, `Date: ${new Date(sale.date).toLocaleDateString('th-TH')}`) + ESCPOS.LINE_FEED;
  if (sale.queueNumber) {
    receipt += leftRight(`Queue: ${sale.queueNumber}`, `Time: ${new Date(sale.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`) + ESCPOS.LINE_FEED;
  }
  receipt += line() + ESCPOS.LINE_FEED;

  // Items
  receipt += ESCPOS.BOLD_ON;
  receipt += leftRight('Item', 'Qty    Price') + ESCPOS.LINE_FEED;
  receipt += ESCPOS.BOLD_OFF;
  receipt += line() + ESCPOS.LINE_FEED;

  sale.items.forEach(item => {
    // Item name (may wrap)
    receipt += item.name + ESCPOS.LINE_FEED;
    // Quantity and price
    const qtyPrice = `${item.quantity} x ${item.price.toFixed(2)}`;
    const total = (item.quantity * item.price).toFixed(2);
    receipt += leftRight(`  ${qtyPrice}`, total) + ESCPOS.LINE_FEED;

    // Instruction if exists
    if (item.instruction) {
      receipt += `  ${item.instruction}` + ESCPOS.LINE_FEED;
    }
  });

  receipt += line() + ESCPOS.LINE_FEED;

  // Totals
  receipt += ESCPOS.BOLD_ON;
  receipt += leftRight('Subtotal:', sale.total.toFixed(2)) + ESCPOS.LINE_FEED;

  if (sale.discount > 0) {
    receipt += leftRight('Discount:', `-${sale.discount.toFixed(2)}`) + ESCPOS.LINE_FEED;
  }

  if (sale.pointsRedeemed > 0) {
    receipt += leftRight('Points Used:', `-${sale.pointsRedeemed}`) + ESCPOS.LINE_FEED;
  }

  // VAT Breakdown
  if (sale.vatAmount > 0) {
    receipt += line('-') + ESCPOS.LINE_FEED;
    receipt += leftRight('Vatable:', sale.subtotalVatable.toFixed(2)) + ESCPOS.LINE_FEED;
    receipt += leftRight('VAT Exempt:', sale.subtotalExempt.toFixed(2)) + ESCPOS.LINE_FEED;
    receipt += leftRight(`VAT (${settings.vatRate}%):`, sale.vatAmount.toFixed(2)) + ESCPOS.LINE_FEED;
  }

  receipt += line('=') + ESCPOS.LINE_FEED;
  receipt += ESCPOS.SIZE_DOUBLE;
  receipt += leftRight('TOTAL:', sale.netTotal.toFixed(2)) + ESCPOS.LINE_FEED;
  receipt += ESCPOS.SIZE_NORMAL;
  receipt += ESCPOS.BOLD_OFF;
  receipt += line('=') + ESCPOS.LINE_FEED;

  // Payment Details
  if (sale.paymentMethod === 'CASH' && sale.tenderedAmount) {
    receipt += leftRight('Cash:', sale.tenderedAmount.toFixed(2)) + ESCPOS.LINE_FEED;
    receipt += leftRight('Change:', (sale.change || 0).toFixed(2)) + ESCPOS.LINE_FEED;
  } else {
    receipt += leftRight('Payment:', sale.paymentMethod) + ESCPOS.LINE_FEED;
  }

  receipt += line() + ESCPOS.LINE_FEED;

  // Footer
  receipt += ESCPOS.ALIGN_CENTER;
  receipt += settings.receiptFooter + ESCPOS.LINE_FEED;
  receipt += 'Thank You!' + ESCPOS.LINE_FEED;
  receipt += line() + ESCPOS.LINE_FEED;

  // QR Code for digital receipt (optional)
  // receipt += generateQRCode(sale.id);

  receipt += ESCPOS.LINE_FEED;
  receipt += ESCPOS.LINE_FEED;
  receipt += ESCPOS.LINE_FEED;

  // Cut paper
  receipt += ESCPOS.CUT;

  return receipt;
}

/**
 * Network Thermal Printer (via IP address)
 */
export class NetworkThermalPrinter {
  private printerIp: string;
  private port: number;

  constructor(printerIp: string, port: number = 9100) {
    this.printerIp = printerIp;
    this.port = port;
  }

  async print(data: string): Promise<void> {
    try {
      // Note: Direct socket connections are not possible from browser
      // This requires a local print server or browser extension
      // Alternative: Use Web Print API or print server middleware

      const response = await fetch(`http://${this.printerIp}:${this.port}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Failed to send to printer');
      }

      console.log('Print job sent successfully');
    } catch (error) {
      console.error('Network printer error:', error);
      throw new Error('Failed to connect to network printer. Please check printer IP and connection.');
    }
  }

  async printReceipt(sale: SaleRecord, settings: Settings): Promise<void> {
    const receiptData = formatReceipt(sale, settings);
    await this.print(receiptData);
  }

  async openCashDrawer(): Promise<void> {
    await this.print(ESCPOS.DRAWER_KICK);
  }
}

/**
 * WebUSB Thermal Printer (direct USB connection)
 */
export class USBThermalPrinter {
  private device: USBDevice | null = null;

  async connect(): Promise<void> {
    try {
      // Request USB device
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x0416 }, // Epson
          { vendorId: 0x04b8 }, // Seiko Epson
          { vendorId: 0x0519 }, // Star Micronics
          { vendorId: 0x1504 }  // Generic ESC/POS
        ]
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      this.device = device;
      console.log('USB Thermal Printer connected');
    } catch (error) {
      console.error('USB connection error:', error);
      throw new Error('Failed to connect to USB printer');
    }
  }

  async print(data: string): Promise<void> {
    if (!this.device) {
      throw new Error('Printer not connected');
    }

    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);

      // Send data to printer (endpoint 1 is typically the OUT endpoint)
      await this.device.transferOut(1, encodedData);

      console.log('Print job sent to USB printer');
    } catch (error) {
      console.error('USB print error:', error);
      throw new Error('Failed to print via USB');
    }
  }

  async printReceipt(sale: SaleRecord, settings: Settings): Promise<void> {
    const receiptData = formatReceipt(sale, settings);
    await this.print(receiptData);
  }

  async openCashDrawer(): Promise<void> {
    await this.print(ESCPOS.DRAWER_KICK);
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.close();
      this.device = null;
    }
  }
}

/**
 * Browser Print Fallback (uses window.print())
 */
export function printReceiptHTML(sale: SaleRecord, settings: Settings): void {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.');
  }

  const html = generateReceiptHTML(sale, settings);

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => printWindow.close(), 500);
  };
}

function generateReceiptHTML(sale: SaleRecord, settings: Settings): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt ${sale.id}</title>
      <style>
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; padding: 10mm; }
        }
        body {
          font-family: monospace;
          font-size: 12px;
          max-width: 80mm;
          margin: 0 auto;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; }
        .large { font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="center bold large">${settings.storeName}</div>
      <div class="center">${settings.address}</div>
      <div class="center">Tel: ${settings.phone}</div>
      <div class="center">Tax ID: ${settings.taxId}</div>
      <div class="line"></div>

      <div class="row">
        <span>Invoice: ${sale.id}</span>
        <span>${new Date(sale.date).toLocaleDateString('th-TH')}</span>
      </div>
      ${sale.queueNumber ? `<div class="row"><span>Queue: ${sale.queueNumber}</span></div>` : ''}
      <div class="line"></div>

      ${sale.items.map(item => `
        <div>${item.name}</div>
        <div class="row">
          <span>  ${item.quantity} x ${item.price.toFixed(2)}</span>
          <span>${(item.quantity * item.price).toFixed(2)}</span>
        </div>
        ${item.instruction ? `<div class="small">  ${item.instruction}</div>` : ''}
      `).join('')}

      <div class="line"></div>
      <div class="row bold"><span>TOTAL:</span><span>${sale.netTotal.toFixed(2)}</span></div>
      <div class="line"></div>

      <div class="center">${settings.receiptFooter}</div>
      <div class="center">Thank You!</div>
    </body>
    </html>
  `;
}

/**
 * Check if WebUSB is supported
 */
export function isWebUSBSupported(): boolean {
  return 'usb' in navigator;
}

export default {
  NetworkThermalPrinter,
  USBThermalPrinter,
  formatReceipt,
  printReceiptHTML,
  isWebUSBSupported,
  ESCPOS
};
