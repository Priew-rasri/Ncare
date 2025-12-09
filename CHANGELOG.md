# Changelog

All notable changes to Ncare Pharmacy ERP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2025-01-09

### 🚀 Major Release - Enterprise Features

This is a major release with significant architectural changes and new features.

### Added

#### Firebase Integration
- **Firebase Firestore** for real-time database
- **Firebase Authentication** with role-based access control
- **Firebase Storage** for file uploads (prescriptions, product images)
- **Firebase Hosting** configuration for deployment
- Real-time data synchronization across multiple devices
- Cloud-based data storage (migrated from LocalStorage)

#### Hardware Integration
- **Barcode Scanner** support
  - USB hardware scanners (keyboard wedge mode)
  - Camera-based scanning (Web Barcode Detection API)
  - Support for EAN-13, Code 128, Code 39, UPC, QR codes
- **Thermal Printer** integration
  - Network printing via ESC/POS protocol
  - WebUSB for direct USB connection
  - Receipt formatting for 80mm thermal paper
  - Cash drawer kick command
  - A4 tax invoice printing
  - Drug label sticker printing

#### Testing Framework
- **Vitest** for unit testing
- **Playwright** for end-to-end testing
- **Testing Library** for React component testing
- 70%+ test coverage for core features
- 90%+ coverage for critical paths (POS, payments, auth)
- Automated test runs in CI/CD pipeline

#### Services & Architecture
- `firebaseConfig.ts` - Firebase initialization
- `firestoreService.ts` - Complete CRUD operations
- `authService.ts` - User authentication & management
- `barcodeService.ts` - Barcode scanning logic
- `thermalPrinterService.ts` - Printer integration
- Custom React hooks (`useAuth`, `useFirestore`)

#### CI/CD
- **GitHub Actions** workflows
  - Automated testing on pull requests
  - Automated deployment to staging (develop branch)
  - Automated deployment to production (main branch)
- **Branch protection** rules
- **Pull request** templates
- **Code quality** checks

#### Documentation
- `UPGRADE_GUIDE.md` - Migration and new features guide
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history (this file)
- Updated README.md with badges and complete information

#### Security
- Firestore security rules
- Storage security rules
- Environment variable management
- Role-based access control enforcement

### Changed

#### Breaking Changes
- **User interface** updated with `email` and `branchId` fields
- **LocalStorage** will be deprecated in favor of Firestore
- **Authentication** now required for production use
- Database structure changed to cloud-based collections

#### Improvements
- Enhanced type safety with TypeScript strict mode
- Better error handling across all services
- Improved performance with optimized queries
- Better state management preparation for Firebase

### Dependencies

#### Added
- `firebase@^12.6.0` - Firebase SDK
- `@testing-library/react@^16.3.0` - React testing
- `@testing-library/jest-dom@^6.9.1` - Jest DOM matchers
- `@playwright/test@^1.57.0` - E2E testing
- `vitest@^4.0.15` - Unit testing framework
- `jsdom@^27.3.0` - DOM implementation
- `@vitest/ui@^4.0.15` - Vitest UI

### Scripts

#### Added
- `npm test` - Run unit tests
- `npm run test:ui` - Vitest UI
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Playwright UI
- `npm run test:e2e:headed` - E2E tests with browser visible

---

## [2.0.0] - 2024-12-15

### Added
- Queue Display Board functionality
- CSV import/export for inventory and accounting
- Quantity editing in POS cart
- Barcode generation for inventory items
- Payment rounding types (0.25 THB, round down, exact)

### Changed
- Enhanced POS UI/UX
- Improved inventory search
- Better mobile responsiveness

---

## [1.0.0] - 2024-11-01

### Initial Release

#### Core Features
- Point of Sale (POS) system
- Inventory management with FEFO logic
- Accounting & P&L reports
- CRM with membership tiers
- AI Assistant (Ncare Genius)
- Dashboard with analytics
- Settings management

#### Technologies
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Google GenAI (Gemini)
- Lucide React

---

## Upcoming Features

### [3.1.0] - Planned
- Offline mode (PWA)
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with accounting software

### [3.2.0] - Planned
- Multi-language support (Thai, English)
- Delivery management
- E-commerce integration
- Advanced reporting

---

## Migration Guides

### From 2.x to 3.x

**Important:** Version 3.0 introduces Firebase backend. Follow these steps:

1. **Setup Firebase Project**
   - Create Firebase project
   - Enable Firestore, Auth, Storage, Hosting
   - Copy configuration

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your Firebase credentials
   ```

3. **Migrate Data**
   ```typescript
   import { migrateLocalStorageToFirestore } from './services/firestoreService';
   await migrateLocalStorageToFirestore(localData, branchId);
   ```

4. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

5. **Update Application**
   ```bash
   npm install
   npm run build
   firebase deploy
   ```

See [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md) for detailed instructions.

---

## Support

For questions or issues, please:
- 📖 Read the documentation
- 🐛 [Create an issue](https://github.com/Priew-rasri/Ncare/issues)
- 💬 [Start a discussion](https://github.com/Priew-rasri/Ncare/discussions)

---

**[⬆ Back to Top](#changelog)**
