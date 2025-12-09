# Ncare Pharmacy ERP - Upgrade Guide

## 🚀 New Features Added

This guide covers all the major upgrades and new features added to the Ncare Pharmacy ERP system.

---

## 📑 Table of Contents

1. [Firebase Integration](#1-firebase-integration)
2. [Real-time Database with Firestore](#2-real-time-database-with-firestore)
3. [Firebase Authentication](#3-firebase-authentication)
4. [Barcode Scanner Integration](#4-barcode-scanner-integration)
5. [Thermal Printer Support](#5-thermal-printer-support)
6. [Testing Framework](#6-testing-framework)
7. [Setup Instructions](#7-setup-instructions)

---

## 1. Firebase Integration

### Overview
The system now uses **Firebase** as the backend instead of LocalStorage, enabling:
- ✅ Real-time data synchronization across devices
- ✅ Multi-branch support with live updates
- ✅ Cloud-based data storage
- ✅ Secure authentication
- ✅ Scalability for multiple users

### Files Added
- `services/firebaseConfig.ts` - Firebase initialization
- `services/firestoreService.ts` - Database operations
- `services/authService.ts` - Authentication service
- `hooks/useFirestore.ts` - React hooks for Firestore
- `hooks/useAuth.ts` - React hooks for authentication

### Configuration
Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 2. Real-time Database with Firestore

### Features
- **Automatic synchronization** across all connected devices
- **Optimistic updates** for better UX
- **Offline support** (coming soon)
- **Transaction support** for complex operations

### Usage Example

```typescript
import { useCollection } from './hooks/useFirestore';
import { COLLECTIONS } from './services/firestoreService';

// Get products with real-time updates
const { data: products, loading } = useCollection<Product>(
  COLLECTIONS.PRODUCTS
);

// Add new product
import { useFirestoreCRUD } from './hooks/useFirestore';

const { add } = useFirestoreCRUD<Product>(COLLECTIONS.PRODUCTS);

await add({
  barcode: '123456',
  name: 'New Product',
  price: 100,
  // ... other fields
});
```

### Collections Structure
```
Firestore Database
├── products/          # Inventory items
├── customers/         # Customer database
├── sales/            # Sales records
├── purchaseOrders/   # PO management
├── suppliers/        # Supplier info
├── stockLogs/        # Inventory movements
├── systemLogs/       # Audit trail
├── expenses/         # Expense tracking
├── shifts/           # Shift management
├── transfers/        # Inter-branch transfers
├── heldBills/        # Pending transactions
├── settings/         # Store settings
├── branches/         # Branch information
└── users/            # User accounts
```

---

## 3. Firebase Authentication

### Features
- ✅ Email/Password authentication
- ✅ Role-based access control (OWNER, PHARMACIST, STAFF)
- ✅ Password reset via email
- ✅ Secure session management
- ✅ User profile management

### Usage Example

```typescript
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { signIn, user, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('email@example.com', 'password');
      // User is now authenticated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <div>...</div>;
}
```

### Creating Users

```typescript
const { signUp } = useAuth();

await signUp(
  'pharmacist@ncare.com',
  'securePassword123',
  {
    name: 'ภญ. สมหญิง',
    username: 'pharmacist1',
    role: 'PHARMACIST',
    branchId: 'B001'
  }
);
```

---

## 4. Barcode Scanner Integration

### Supported Methods
1. **Hardware USB Scanner** (Keyboard Wedge Mode)
2. **Web Barcode Detection API** (Camera-based)
3. **Manual Entry** (Fallback)

### Features
- ✅ Automatic barcode detection from USB scanners
- ✅ Camera scanning for mobile devices
- ✅ Support for multiple barcode formats:
  - EAN-13, EAN-8
  - Code 128, Code 39, Code 93
  - UPC-A, UPC-E
  - QR Codes

### Usage Example

```typescript
import { BarcodeScanner } from './services/barcodeService';

// Initialize scanner
const scanner = new BarcodeScanner((barcode) => {
  console.log('Scanned:', barcode);
  // Search for product with this barcode
  searchProduct(barcode);
});

// Enable hardware scanner (USB)
scanner.enableHardwareScanner();

// OR enable camera scanner
const videoElement = document.getElementById('scanner-video');
await scanner.enableCameraScanner(videoElement);

// Cleanup when done
scanner.destroy();
```

### Browser Support
- **Hardware Scanner**: All browsers ✅
- **Camera Scanner**: Chrome, Edge, Safari (requires Barcode Detection API)

---

## 5. Thermal Printer Support

### Supported Methods
1. **Network Printing** (IP-based)
2. **WebUSB** (Direct USB connection)
3. **Browser Print** (Fallback)

### Features
- ✅ ESC/POS command support (80mm thermal printers)
- ✅ Automatic receipt formatting
- ✅ Cash drawer kick command
- ✅ VAT breakdown on receipts
- ✅ QR code support (optional)

### Usage Example

#### Network Printer
```typescript
import { NetworkThermalPrinter } from './services/thermalPrinterService';

const printer = new NetworkThermalPrinter('192.168.1.200', 9100);

// Print receipt
await printer.printReceipt(saleRecord, settings);

// Open cash drawer
await printer.openCashDrawer();
```

#### USB Printer
```typescript
import { USBThermalPrinter } from './services/thermalPrinterService';

const printer = new USBThermalPrinter();

// Connect to printer
await printer.connect();

// Print receipt
await printer.printReceipt(saleRecord, settings);

// Disconnect
await printer.disconnect();
```

#### Browser Fallback
```typescript
import { printReceiptHTML } from './services/thermalPrinterService';

// Uses window.print()
printReceiptHTML(saleRecord, settings);
```

### Printer Compatibility
- Epson TM-series
- Star Micronics
- Any ESC/POS compatible thermal printer

---

## 6. Testing Framework

### Unit Testing (Vitest)

Run tests:
```bash
npm test              # Run all tests
npm run test:ui       # Open test UI
npm run test:coverage # Generate coverage report
```

Write tests in `/tests` directory:
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(2 + 2).toBe(4);
  });
});
```

### E2E Testing (Playwright)

Run E2E tests:
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Open Playwright UI
npm run test:e2e:headed  # Run with browser visible
```

Write E2E tests in `/e2e` directory:
```typescript
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/');
  await page.click('text=ภก. สมชาย (Owner)');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Test Coverage
- ✅ Unit tests for core business logic
- ✅ E2E tests for critical user flows
- ✅ Authentication tests
- ✅ POS workflow tests

---

## 7. Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase project (create at [firebase.google.com](https://firebase.google.com))
- npm or yarn

### Installation Steps

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd Ncare
npm install
```

2. **Setup Firebase**
- Create a Firebase project
- Enable Firestore Database
- Enable Authentication (Email/Password)
- Copy your Firebase config

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

4. **Initialize Firestore security rules**
Create `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Admin-only collections
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'OWNER';
    }
  }
}
```

5. **Run development server**
```bash
npm run dev
```

6. **Run tests**
```bash
npm test           # Unit tests
npm run test:e2e   # E2E tests
```

7. **Build for production**
```bash
npm run build
npm run deploy     # Deploy to Firebase Hosting
```

---

## 🔧 Migration from LocalStorage

To migrate existing LocalStorage data to Firestore:

```typescript
import { migrateLocalStorageToFirestore } from './services/firestoreService';

// Get existing data
const localData = JSON.parse(
  localStorage.getItem('pharmaflow_db_v1') || '{}'
);

// Migrate to Firestore
await migrateLocalStorageToFirestore(localData, 'B001'); // Branch ID
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [ESC/POS Commands Reference](https://reference.epson-biz.com/modules/ref_escpos/)

---

## ⚠️ Important Notes

1. **Security**: Never commit `.env` file to git
2. **Firestore Rules**: Configure proper security rules before production
3. **Hardware**: Barcode scanners and thermal printers require proper drivers
4. **Browser Support**: Camera barcode scanning requires modern browsers
5. **Network**: Thermal printers must be on the same network

---

## 🐛 Troubleshooting

### Firebase Connection Issues
```bash
# Check Firebase config in .env
# Ensure Firestore is enabled in Firebase Console
# Check browser console for error messages
```

### Barcode Scanner Not Working
```bash
# For USB scanner: Check if device is in keyboard wedge mode
# For camera: Check browser permissions
# Test with BarcodeScanner.isBarcodeDetectionSupported()
```

### Thermal Printer Not Printing
```bash
# Check printer IP address and port
# Ensure printer is ESC/POS compatible
# Test with ping command
# For USB: Check WebUSB support with isWebUSBSupported()
```

---

## 📞 Support

For issues or questions, please create an issue in the repository or contact the development team.

**Happy coding! 🚀**
