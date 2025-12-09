# Contributing to Ncare Pharmacy ERP

Thank you for your interest in contributing to Ncare Pharmacy ERP! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on collaboration
- Maintain professionalism

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/Ncare.git
cd Ncare

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start development server
npm run dev
```

---

## Development Workflow

### Branch Strategy

We follow **Git Flow**:

```
main (production)
├── develop (staging)
    ├── feature/feature-name
    ├── bugfix/bug-name
    ├── hotfix/fix-name
```

### Creating a Feature Branch

```bash
# Switch to develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Work on your feature...

# Commit your changes
git add .
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request to develop branch
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/barcode-scanner`)
- `bugfix/` - Bug fixes (e.g., `bugfix/payment-calculation`)
- `hotfix/` - Urgent production fixes (e.g., `hotfix/security-patch`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `docs/` - Documentation updates (e.g., `docs/api-guide`)
- `test/` - Test improvements (e.g., `test/pos-e2e`)

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use strict mode

```typescript
// ✅ Good
interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ Bad
const product: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// ✅ Good
interface POSProps {
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}

const POS: React.FC<POSProps> = ({ state, dispatch }) => {
  // Component logic
};

// ❌ Bad
const POS = (props: any) => { ... };
```

### File Organization

```
/src
  /components     # React components
  /services       # Business logic & API calls
  /hooks          # Custom React hooks
  /types          # TypeScript type definitions
  /utils          # Utility functions
  /constants      # Constants and configuration
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase (e.g., `firestoreService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)
- **Types/Interfaces**: PascalCase (e.g., `UserRole`)

---

## Commit Messages

We follow **Conventional Commits** specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(pos): add barcode scanner support"

# Bug fix
git commit -m "fix(inventory): correct FEFO batch deduction logic"

# Documentation
git commit -m "docs: update deployment guide"

# Multiple changes
git commit -m "feat(pos): add thermal printer integration

- Add ESC/POS command support
- Implement network and USB printing
- Add receipt formatting

Closes #123"
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (browser visible)
npm run test:e2e:headed
```

### Writing Tests

**Unit Test Example:**

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateVAT', () => {
  it('should calculate correct VAT', () => {
    expect(calculateVAT(107, 7)).toBe(7);
  });
});
```

**E2E Test Example:**

```typescript
import { test, expect } from '@playwright/test';

test('should complete checkout flow', async ({ page }) => {
  await page.goto('/pos');
  await page.click('text=Add Product');
  await expect(page.getByText('Cart')).toBeVisible();
});
```

### Test Coverage Requirements

- **Minimum coverage**: 70%
- **Critical paths**: 90%+ (POS, Authentication, Payments)
- All new features must include tests

---

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Check TypeScript**
   ```bash
   npx tsc --noEmit
   ```

3. **Build successfully**
   ```bash
   npm run build
   ```

4. **Update documentation** if needed

### Submitting PR

1. Fill out the PR template completely
2. Link related issues
3. Add screenshots for UI changes
4. Request review from maintainers

### PR Review Checklist

Reviewers will check:

- ✅ Code quality and style
- ✅ Tests are adequate
- ✅ No security vulnerabilities
- ✅ Documentation is updated
- ✅ No breaking changes (or properly documented)
- ✅ Performance impact is acceptable

### After Approval

- **Do not force push** after approval
- Maintainers will merge using **squash and merge**
- Delete your feature branch after merge

---

## Firebase Development

### Using Firebase Emulator (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start
```

### Firestore Rules Testing

```bash
# Test security rules
firebase emulators:exec --only firestore "npm test"
```

---

## Common Issues

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests Fail

```bash
# Update test snapshots
npm test -- -u
```

### Firebase Connection Issues

```bash
# Check environment variables
cat .env

# Verify Firebase config
firebase projects:list
```

---

## Questions or Problems?

- 📧 Email: support@ncare-pharmacy.com
- 💬 Discussions: [GitHub Discussions](https://github.com/Priew-rasri/Ncare/discussions)
- 🐛 Bugs: [GitHub Issues](https://github.com/Priew-rasri/Ncare/issues)

---

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project documentation

Thank you for contributing! 🙏
