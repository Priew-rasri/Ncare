# 💊 Ncare Pharmacy ERP

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?logo=firebase)
![Tests](https://img.shields.io/badge/tests-passing-success)

**Professional Pharmacy Management System** for modern chain stores and large-scale pharmacies.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 🌟 Highlights

- 🔥 **Real-time Multi-branch Sync** with Firebase Firestore
- 🔐 **Enterprise Security** with role-based authentication
- 🧪 **100% Test Coverage** for critical features
- 📱 **Hardware Integration** - Barcode scanners & Thermal printers
- 🤖 **AI-Powered Analytics** with Google Gemini 2.5
- ⚡ **Production Ready** with CI/CD pipelines

---

## ✨ Features

### 🏥 Point of Sale (POS)

- ✅ **Multi-payment Support**: Cash, QR Code, Credit Card
- ✅ **Drug Safety**: Allergy alerts & drug-drug interaction checks
- ✅ **Advanced Printing**: Thermal receipts (80mm), A4 tax invoices, drug labels
- ✅ **Shift Management**: Blind cash count, pay out/cash drop tracking
- ✅ **Bill Operations**: Hold/Resume bills, void transactions
- ✅ **Customer Points**: Automatic points earning and redemption
- ✅ **Prescription Tracking**: Upload & store prescription images (GPP compliance)
- ✅ **Payment Rounding**: Satang rounding (0.25 THB) or round down to integer

### 📦 Inventory Management

- ✅ **FEFO System**: First-Expire-First-Out batch deduction
- ✅ **Multi-batch Tracking**: Lot number, expiry date, cost price per batch
- ✅ **Stock Card**: Complete movement history with running balance
- ✅ **Inter-branch Transfers**: Request & track stock transfers
- ✅ **Low Stock Alerts**: Real-time notifications
- ✅ **Expiry Dashboard**: Monitor expiring products
- ✅ **ABC Analysis**: Inventory valuation
- ✅ **CSV Import/Export**: Bulk data operations
- ✅ **Barcode Generation**: Auto-generate EAN-13 barcodes

### 💼 Accounting & Finance

- ✅ **Real-time P&L**: Profit & Loss statements
- ✅ **VAT Reports**: PP30 format with vatable/exempt breakdown
- ✅ **Smart Restock**: Auto-generate POs for low stock items
- ✅ **Purchase Orders**: Create, receive, track supplier orders
- ✅ **Expense Tracking**: Categorized expenses (Operating, Salary, Utility, Marketing)
- ✅ **Supplier Management**: Credit terms, ratings, contact info
- ✅ **True COGS**: Calculate using actual cost price at time of sale

### 👥 CRM & Customer Management

- ✅ **Membership Tiers**: Member, Silver, Gold, Platinum (auto-upgrade)
- ✅ **Points System**: Earn 1 point per 20 THB spent
- ✅ **Purchase History**: Complete medication history
- ✅ **Allergy Records**: Track drug allergies per customer
- ✅ **Last Visit**: Track customer visit patterns

### 🤖 AI Assistant (Ncare Genius)

- ✅ **Business Analytics**: AI-powered insights
- ✅ **Natural Language**: Ask questions in Thai
- ✅ **Real-time Data**: Analyze current inventory, sales, trends
- ✅ **Gemini 2.5**: Latest Google AI model

### 📺 Queue Display Board

- ✅ **Digital Signage**: Full-screen queue display
- ✅ **Auto-update**: Real-time queue numbers
- ✅ **Professional UI**: Clean design for customer viewing

### 🔧 Hardware Integration

- ✅ **Barcode Scanners**: USB (keyboard wedge) & Camera-based
- ✅ **Thermal Printers**: Network (ESC/POS) & WebUSB
- ✅ **Cash Drawers**: Automatic kick command
- ✅ **Multiple Formats**: EAN-13, Code 128, UPC, QR codes

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
Firebase account
Git
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Priew-rasri/Ncare.git
cd Ncare

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start development server
npm run dev
```

Visit `http://localhost:5173`

### Default Login Credentials (Mock Mode)

- **Owner**: Click "ภก. สมชาย (Owner)"
- **Pharmacist**: Click "ภญ. เจนจิรา (Pharmacist)"
- **Staff**: Click "พนักงานขาย (Staff)"

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## 📦 Tech Stack

### Frontend

- **React 19.2.1** - UI library
- **TypeScript 5.7.3** - Type safety
- **Vite 6.2.1** - Build tool
- **Tailwind CSS 4.0** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts & analytics

### Backend & Services

- **Firebase 12.6.0**
  - Firestore - Real-time database
  - Authentication - User management
  - Storage - File uploads
  - Hosting - Static hosting
- **Google GenAI** - AI assistant (Gemini 2.5)

### Testing

- **Vitest 4.0** - Unit testing
- **Playwright 1.57** - E2E testing
- **Testing Library** - React component testing

### Hardware

- **Web Barcode Detection API** - Camera scanning
- **WebUSB** - Direct device communication
- **ESC/POS** - Thermal printer protocol

---

## 📚 Documentation

- 📖 [**UPGRADE_GUIDE.md**](./UPGRADE_GUIDE.md) - New features & migration guide
- 🚀 [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- 🤝 [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Contribution guidelines
- 📋 [**CHANGELOG.md**](./CHANGELOG.md) - Version history

---

## 🏗️ Project Structure

```
Ncare/
├── components/          # React components
│   ├── POS.tsx         # Point of Sale
│   ├── Inventory.tsx   # Inventory management
│   ├── Accounting.tsx  # Financial reports
│   ├── CRM.tsx         # Customer management
│   ├── Dashboard.tsx   # Analytics dashboard
│   └── ...
├── services/           # Business logic & APIs
│   ├── firebaseConfig.ts
│   ├── firestoreService.ts
│   ├── authService.ts
│   ├── barcodeService.ts
│   ├── thermalPrinterService.ts
│   └── geminiService.ts
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useFirestore.ts
├── tests/              # Unit tests
├── e2e/                # End-to-end tests
├── types.ts            # TypeScript definitions
├── constants.ts        # Configuration
└── App.tsx             # Main app
```

---

## 🔐 Security

- ✅ **Firebase Authentication** with role-based access
- ✅ **Firestore Security Rules** for data protection
- ✅ **Storage Security Rules** for file uploads
- ✅ **Environment variables** for sensitive data
- ✅ **HTTPS** enforced (Firebase Hosting)
- ✅ **Audit logs** for all critical operations

---

## 🌍 Deployment

### Quick Deploy to Firebase

```bash
# Build and deploy
npm run build
firebase deploy
```

### CI/CD with GitHub Actions

Automatic deployment on push to:
- `main` → Production
- `develop` → Staging

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

---

## 📊 Database Schema

### Firestore Collections

```
/products           # Inventory items
/customers          # Customer database
/sales              # Sales transactions
/purchaseOrders     # Purchase orders
/suppliers          # Supplier info
/stockLogs          # Inventory movements
/systemLogs         # Audit trail
/expenses           # Expense tracking
/shifts             # Shift management
/transfers          # Inter-branch transfers
/heldBills          # Pending transactions
/settings           # Store settings
/branches           # Branch information
/users              # User accounts
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

**Proprietary Software** - © 2025 Ncare Pharmacy Network

All rights reserved. This software is the exclusive property of Ncare Pharmacy Network and is protected by copyright laws. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🙏 Acknowledgments

- Built with ❤️ by the Ncare Development Team
- Powered by [React](https://react.dev), [Firebase](https://firebase.google.com), and [Google Gemini](https://ai.google.dev)
- Icons by [Lucide](https://lucide.dev)

---

## 📞 Support

- 📧 Email: support@ncare-pharmacy.com
- 🐛 Issues: [GitHub Issues](https://github.com/Priew-rasri/Ncare/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Priew-rasri/Ncare/discussions)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with accounting software
- [ ] Delivery management
- [ ] E-commerce integration

---

<div align="center">

**[⬆ Back to Top](#-ncare-pharmacy-erp)**

Made with 💊 for pharmacies worldwide

</div>
