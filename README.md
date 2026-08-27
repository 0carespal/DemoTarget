# DemoTarget

A lightweight TypeScript pricing and validation engine used by internal commerce services.

---

## Overview

**DemoTarget** provides core business domain logic for shopping cart pricing calculations, discount applications, and input validation. It is designed to be embedded into internal commerce microservices and web applications, offering strongly-typed, reusable primitives with zero runtime external dependencies.

### Core Features

- **Cart & Subtotal Calculations:** Compute line item subtotal totals with item level validation.
- **Discount Engine:** Modular discount application supporting percentage and fixed monetary discounts, powered by an extensible Strategy pattern.
- **Input Validation:** Utilities for email verification, password strength enforcement, and field-level validation.

---

## Installation

Install dependencies using `npm`:

```bash
npm install
```

To compile TypeScript source files into JavaScript and declaration types:

```bash
npm run build
```

---

## Running Tests

The test suite is powered by **Jest** and covers pricing calculations, discount strategies, and input validation rules.

Run the test suite:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Run linting checks:

```bash
npm run lint
```

---

## Folder Structure

```text
DemoTarget/
├── src/
│   ├── cart/
│   │   ├── cartService.ts    # Pricing engine, discount application & ShoppingCart
│   │   └── types.ts          # Cart, discount, and calculation domain types
│   ├── validation/
│   │   └── validator.ts      # Input validation utilities & Validator class
│   └── index.ts              # Package entry point & public API barrel exports
├── tests/
│   ├── cartService.test.ts   # Unit tests for pricing engine & cart service
│   └── validation.test.ts    # Unit tests for input validators
├── dist/                     # Compiled JavaScript and TypeScript declaration files
├── package.json
├── tsconfig.json
├── jest.config.js
├── AGENT.md
└── README.md
```

---

## Usage Example

### Pricing Engine

```typescript
import { calculateSubtotal, applyDiscounts, calculateTotal, CartItem, Discount } from 'demotarget';

const items: CartItem[] = [
  { id: 'item-1', name: 'Keyboard', price: 79.99, quantity: 1 },
  { id: 'item-2', name: 'Mouse', price: 29.99, quantity: 2 },
];

const subtotal = calculateSubtotal(items);
console.log('Subtotal:', subtotal); // 139.97

const discounts: Discount[] = [
  { type: 'percentage', value: 10 },
];

const finalTotal = calculateTotal(items, discounts);
console.log('Final Total:', finalTotal);
```

### Validation Utilities

```typescript
import { isValidEmail, isValidPassword } from 'demotarget';

console.log(isValidEmail('user@example.com')); // true
console.log(isValidPassword('SecurePass123!')); // true
```

---

## Development Workflow

1. **Feature Development:** Create focused feature or fix branches for changes.
2. **Code Standards:** Ensure code complies with TypeScript strict mode, ESLint rules, and project formatting guidelines (`npm run lint`).
3. **Automated Testing:** All business logic changes must be covered by unit tests in the `tests/` directory (`npm test`).
4. **Build Verification:** Run `npm run build` to verify clean compilation before submitting pull requests.
