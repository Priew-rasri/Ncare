
# Ncare Pharmacy ERP (Enterprise System)

**Professional Pharmacy Management System** designed for modern chain stores and large-scale pharmacies. Built with React, TypeScript, and Google GenAI.

## Features

### 🏥 Point of Sale (POS)
- **Professional Checkout:** Support Cash, QR, Credit Card with exact change calculation.
- **Safety First:** Drug Allergy Alerts & **Drug-Drug Interaction Checks**.
- **Printing:** Support Thermal Slips (80mm), Drug Labels (Stickers), and A4 Full Tax Invoices.
- **Operations:** Hold/Resume Bill, Void Transaction, Shift Management (Blind Cash Count).

### 📦 Inventory Management
- **FEFO Logic:** First-Expire-First-Out logic for automatic batch deduction.
- **Audit Trail:** Complete Stock Movement Logs and Stock Card visualization.
- **Transfers:** Inter-branch stock transfer requests.
- **Valuation:** ABC Analysis and Expiry Risk Dashboard.

### 💼 Enterprise ERP
- **Accounting:** Real-time P&L, VAT Reports (P.P.30), Expense Tracking.
- **Purchasing:** Smart Restock (Auto PO generation) and Supplier Management.
- **CRM:** Membership Tiers (Member/Silver/Gold/Platinum), Purchase History.

### 🤖 AI Integration
- **Ncare Genius:** Built-in AI assistant powered by **Google Gemini 2.5** for business analytics and stock insights.

---

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ncare-erp.git
   cd ncare-erp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Google Gemini API Key:
   ```env
   VITE_API_KEY=your_google_gemini_api_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## Deployment (Firebase Hosting)

This project is configured for **Firebase Hosting** (Google Cloud).

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Google**
   ```bash
   firebase login
   ```

3. **Initialize Project** (If not already configured)
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **AI:** Google GenAI SDK (Gemini 2.5)
- **Icons:** Lucide React

---

## License

Proprietary Software for Ncare Pharmacy Network.
