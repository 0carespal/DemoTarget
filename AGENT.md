# AGENT.md

## Overview

DemoTarget is a lightweight TypeScript cart and discount engine used by internal services to calculate order totals and validate user input.

The project focuses on:

- Cart subtotal calculations
- Discount application logic
- Validation utilities
- Automated testing

The codebase is intentionally small but follows production-style engineering practices.

---

## Project Structure

```text
src/
├── cart/
│   ├── cartService.ts
│   └── types.ts
├── validation/
│   └── validator.ts
└── index.ts

tests/
├── cartService.test.ts
└── validation.test.ts
```

### Cart Domain

Files under `src/cart/` contain:

- `types.ts` — cart item, discount, and related type definitions
- `cartService.ts` — subtotal calculation, discount application, and total pricing logic

### Validation Domain

Files under `src/validation/` contain:

- `validator.ts` — email validation, password validation, and other input validation helpers

### Entry Point

`src/index.ts` wires the modules together and is the entry point for the package.

### Tests

Tests are located under `tests/`, mirroring the source modules they cover (`cartService.test.ts`, `validation.test.ts`).

Every behavior change should be validated through the test suite.

---

## Development Workflow

When working on an issue:

1. Read the issue description carefully.
2. Identify affected files.
3. Understand existing behavior before modifying code.
4. Make the smallest reasonable change that resolves the issue.
5. Run the full test suite.
6. Verify no unrelated tests fail.
7. Prepare a concise summary of the changes.

---

## Expectations

**Prefer Small Changes**

Avoid large refactors unless explicitly requested. Issue fixes should be focused and easy to review.

**Preserve Existing Behavior**

Do not modify unrelated functionality. Changes should be limited to the scope of the issue.

**Follow Existing Patterns**

Match:

- Naming conventions
- File structure
- Coding style
- Existing abstractions

Avoid introducing new frameworks or architectural patterns.

**Respect Linting and Formatting**

This project uses ESLint (`.eslintrc.json`) and Prettier (`.prettierrc`). Code should pass `npm run lint` and match the configured formatting style before a change is considered complete.

---

## Testing Requirements

Before considering an issue complete:

```
npm test
```

must pass. Tests are configured via `jest.config.js`. A fix is not considered complete if tests fail.

If a test fails after a change:

1. Investigate the failure.
2. Determine whether the implementation or the test is incorrect.
3. Apply the smallest appropriate fix.
4. Re-run the test suite.

---

## Git Guidelines

Use clear commit messages.

Examples:

- `fix: correct discount stacking logic in cartService`
- `fix: enforce special characters in passwords`
- `feat: add coupon expiration support`

Avoid generic messages such as:

- `update code`
- `fix bug`
- `changes`

---

## Pull Request Guidelines

A pull request summary should include:

**Problem** — Brief description of the issue.

**Root Cause** — Explanation of why the issue occurred.

**Solution** — Summary of the implementation.

**Validation** — Tests executed and results.

---

## Issue Priorities

Priority order:

1. Correctness
2. Test coverage
3. Simplicity
4. Maintainability

Performance optimization should only be performed when required by the issue.

---

## Common Commands

Install dependencies:

```
npm install
```

Run tests:

```
npm test
```

Run tests in watch mode:

```
npm run test:watch
```

Build project:

```
npm run build
```

Lint project:

```
npm run lint
```

Format project:

```
npm run format
```

---

## Success Criteria

An issue is considered complete when:

- The reported problem is resolved.
- All tests pass.
- Linting and formatting checks pass.
- No unrelated behavior changes were introduced.
- The change is easy to understand and review.
