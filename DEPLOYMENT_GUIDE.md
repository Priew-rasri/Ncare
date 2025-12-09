# 🚀 Deployment Guide - Ncare Pharmacy ERP

Complete guide for deploying Ncare Pharmacy ERP to Google Cloud (Firebase).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Environment Configuration](#environment-configuration)
5. [Initial Deployment](#initial-deployment)
6. [CI/CD Setup](#cicd-setup)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Tools

```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# Firebase CLI
npm install -g firebase-tools

# Git
git --version
```

### Required Accounts

- ✅ Firebase/Google Cloud account
- ✅ GitHub account
- ✅ Google Gemini API key (for AI features)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `ncare-pharmacy-prod`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Firebase Services

#### Enable Firestore Database

```bash
# Navigate to Firestore Database in Firebase Console
# Click "Create database"
# Choose location: asia-southeast1 (Bangkok)
# Start in production mode
```

#### Enable Authentication

```bash
# Navigate to Authentication
# Click "Get started"
# Enable "Email/Password" sign-in method
```

#### Enable Storage

```bash
# Navigate to Storage
# Click "Get started"
# Choose location: asia-southeast1
# Start in production mode
```

#### Enable Hosting

```bash
# Navigate to Hosting
# Click "Get started"
# Follow the setup wizard
```

### Step 3: Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"**
3. Click **"Web"** icon (</> icon)
4. Register app name: `Ncare Pharmacy Web`
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ncare-pharmacy-prod.firebaseapp.com",
  projectId: "ncare-pharmacy-prod",
  storageBucket: "ncare-pharmacy-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Create Service Account (for CI/CD)

```bash
# 1. Go to Google Cloud Console
# https://console.cloud.google.com

# 2. Select your project

# 3. Navigate to IAM & Admin > Service Accounts

# 4. Create service account
# Name: github-actions
# Role: Firebase Admin

# 5. Create JSON key
# Download the JSON file
```

---

## GitHub Repository Setup

### Step 1: Repository Settings

#### Enable GitHub Actions

```bash
# Go to repository Settings > Actions > General
# Select: "Allow all actions and reusable workflows"
```

#### Add Repository Secrets

Go to **Settings > Secrets and variables > Actions** and add:

**Production Secrets:**
```
PROD_FIREBASE_API_KEY=AIzaSy...
PROD_FIREBASE_AUTH_DOMAIN=ncare-pharmacy-prod.firebaseapp.com
PROD_FIREBASE_PROJECT_ID=ncare-pharmacy-prod
PROD_FIREBASE_STORAGE_BUCKET=ncare-pharmacy-prod.appspot.com
PROD_FIREBASE_MESSAGING_SENDER_ID=123456789
PROD_FIREBASE_APP_ID=1:123456789:web:abc123
PROD_GEMINI_API_KEY=your_gemini_api_key

FIREBASE_SERVICE_ACCOUNT=<paste entire JSON from service account>
FIREBASE_TOKEN=<get from: firebase login:ci>
```

**Staging Secrets:** (if using staging environment)
```
STAGING_FIREBASE_API_KEY=...
STAGING_FIREBASE_AUTH_DOMAIN=...
# ... (same as production but for staging project)
```

### Step 2: Branch Protection Rules

Protect `main` and `develop` branches:

```bash
# Settings > Branches > Add rule

Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date
  - Status checks: test, lint, build, e2e
✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings
```

---

## Environment Configuration

### Step 1: Create Environment Files

**Production (.env.production):**
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=ncare-pharmacy-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ncare-pharmacy-prod
VITE_FIREBASE_STORAGE_BUCKET=ncare-pharmacy-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_KEY=your_gemini_api_key_production
```

**Staging (.env.staging):**
```env
VITE_FIREBASE_API_KEY=your_staging_api_key
# ... staging credentials
```

**Development (.env):**
```env
VITE_FIREBASE_API_KEY=your_dev_api_key
# ... development credentials (or use emulator)
```

### Step 2: Update Firebase Config

```bash
# Initialize Firebase in your project
firebase init

# Select services:
# ✅ Firestore
# ✅ Hosting
# ✅ Storage

# Firestore rules file: firestore.rules
# Hosting public directory: dist
# Single-page app: Yes
# Automatic builds: No (we use GitHub Actions)
```

---

## Initial Deployment

### Step 1: Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run tests
npm test
npm run test:e2e

# 4. Build
npm run build

# 5. Preview locally
npm run preview
```

### Step 2: Deploy Firestore Rules

```bash
# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Step 3: Create First Admin User

```bash
# Option 1: Through Firebase Console
# Go to Authentication > Users > Add user
# Email: admin@ncare.com
# Password: (secure password)

# Then add user document in Firestore:
# Collection: users
# Document ID: (same as auth UID)
# Data:
{
  id: "auth_uid",
  email: "admin@ncare.com",
  username: "admin",
  name: "System Admin",
  role: "OWNER",
  branchId: "B001"
}
```

### Step 4: Initialize Database

```bash
# Create initial collections and documents
# You can use the migration function or manually create:

# 1. Create settings document
Collection: settings
Document ID: settings_B001
Data: { ...settings from MOCK_SETTINGS }

# 2. Create branch document
Collection: branches
Document ID: B001
Data: { id: 'B001', name: 'Ncare HQ', location: 'Bangkok', type: 'HQ' }
```

### Step 5: First Deployment

```bash
# Deploy to Firebase Hosting
npm run build
firebase deploy --only hosting

# Your app is now live at:
# https://ncare-pharmacy-prod.web.app
```

---

## CI/CD Setup

### Workflow Overview

```
Developer Push
    ↓
GitHub Actions (CI)
    ├── Run Tests
    ├── Type Check
    ├── Build
    └── E2E Tests
    ↓
Merge to develop
    ↓
Auto Deploy to Staging
    ↓
Merge to main
    ↓
Auto Deploy to Production
```

### CI Workflow (Automatic)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Actions:**
- Install dependencies
- Run unit tests
- Run E2E tests
- Type checking
- Build project
- Upload artifacts

### CD Workflows (Automatic)

**Staging Deployment** (`develop` branch):
- Builds project with staging config
- Deploys to Firebase Hosting staging channel
- Preview URL: `https://PROJECT_ID--staging.web.app`

**Production Deployment** (`main` branch):
- Runs full test suite
- Builds project with production config
- Deploys to Firebase Hosting live channel
- Deploys Firestore & Storage rules
- Live URL: `https://PROJECT_ID.web.app`

---

## Production Deployment

### Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Firestore rules deployed
- [ ] Environment variables configured
- [ ] Backup current production database
- [ ] Notify team of deployment

### Manual Deployment Process

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run full test suite
npm test
npm run test:e2e

# 3. Build production
npm run build

# 4. Deploy to Firebase
firebase deploy

# Or deploy specific services:
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Rollback Procedure

If something goes wrong:

```bash
# Option 1: Revert to previous deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID SITE_ID:live

# Option 2: Deploy previous version
git checkout <previous-commit>
npm run build
firebase deploy --only hosting
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check Firebase services status
firebase status

# View hosting releases
firebase hosting:channel:list

# View Firestore indexes
firebase firestore:indexes
```

### Performance Monitoring

1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. Add monitoring SDK (optional for web)

### Analytics

1. Go to Firebase Console > Analytics
2. Review user metrics
3. Set up custom events

### Error Tracking

1. Enable Crashlytics (optional)
2. Monitor error rates
3. Set up alerts

### Database Backup

```bash
# Export Firestore data
gcloud firestore export gs://[BUCKET_NAME]/backups/$(date +%Y%m%d)

# Schedule automated backups (Cloud Scheduler)
# Set up daily backups at 2 AM
```

### Cost Monitoring

```bash
# Set up budget alerts
# Firebase Console > Usage and billing > Budget & alerts

Recommended limits:
- Firestore reads: 1M/day free tier
- Hosting bandwidth: 10 GB/month free tier
- Storage: 5 GB free tier
```

---

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

**Deployment Fails:**
```bash
# Re-authenticate
firebase logout
firebase login

# Check project
firebase projects:list
firebase use ncare-pharmacy-prod
```

**Firestore Permission Denied:**
```bash
# Verify security rules
firebase deploy --only firestore:rules

# Test rules
firebase emulators:start --only firestore
```

**Environment Variables Not Working:**
```bash
# Verify .env file exists
cat .env

# Rebuild
npm run build
```

---

## Security Best Practices

1. **Never commit secrets** to git
2. **Use environment variables** for all credentials
3. **Enable 2FA** on Firebase/Google accounts
4. **Regularly update dependencies**: `npm audit fix`
5. **Monitor access logs** in Firebase Console
6. **Implement rate limiting** in Firestore rules
7. **Use HTTPS** always (automatic with Firebase Hosting)
8. **Regular security audits** of Firestore rules

---

## Scaling Considerations

### Database Optimization

```bash
# Create composite indexes for common queries
# Firebase Console > Firestore > Indexes

# Example indexes:
products: branchId, stock (ASC)
sales: branchId, date (DESC)
```

### Caching Strategy

```typescript
// Implement service worker for offline support
// Use Firebase Hosting CDN (automatic)
// Cache static assets
```

### Load Testing

```bash
# Use tools like Apache JMeter or k6
# Test concurrent users
# Monitor Firebase quotas
```

---

## Support & Resources

- 📚 [Firebase Documentation](https://firebase.google.com/docs)
- 🔧 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 💬 [Firebase Community](https://firebase.community)
- 🎓 [Firebase Codelabs](https://firebase.google.com/codelabs)

---

## Success Metrics

After deployment, monitor:

- ✅ Uptime: 99.9%+
- ✅ Page load time: < 3 seconds
- ✅ Error rate: < 0.1%
- ✅ User satisfaction
- ✅ System performance

---

**Congratulations! Your Ncare Pharmacy ERP is now live! 🎉**
