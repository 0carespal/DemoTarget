import {
  CartItem,
  Discount,
  DiscountResult,
  AppliedDiscount,
  CartSummary,
  DiscountStrategy,
} from './types';

// ============================================================================
// Internal Strategy Registry Implementation
// ============================================================================

/**
 * Registry holding all active discount application strategies.
 * Strategies are tried in priority order (lower number = higher priority).
 */
class DiscountStrategyRegistry {
  private strategies: DiscountStrategy[] = [];

  constructor() {
    this.registerDefaults();
  }

  /**
   * Register default built-in discount strategies.
   */
  private registerDefaults(): void {
    // Standard percentage discount strategy
    this.register({
      name: 'percentage',
      priority: 10,
      apply: (subtotal: number, discount: Discount): DiscountResult => {
        if (discount.type !== 'percentage') {
          return { applied: false, amount: 0, reason: 'Type mismatch' };
        }
        if (typeof discount.value !== 'number' || discount.value < 0) {
          return { applied: false, amount: 0, reason: 'Invalid discount value' };
        }
        const effectiveSubtotal = Math.max(0, subtotal);
        const amount = Math.round((effectiveSubtotal * discount.value) / 100 * 100) / 100;
        return { applied: true, amount };
      },
    });

    // Standard fixed-amount discount strategy
    this.register({
      name: 'fixed',
      priority: 20,
      apply: (subtotal: number, discount: Discount): DiscountResult => {
        if (discount.type !== 'fixed') {
          return { applied: false, amount: 0, reason: 'Type mismatch' };
        }
        if (typeof discount.value !== 'number' || discount.value < 0) {
          return { applied: false, amount: 0, reason: 'Invalid discount value' };
        }
        const effectiveSubtotal = Math.max(0, subtotal);
        const amount = Math.min(discount.value, effectiveSubtotal);
        return { applied: true, amount };
      },
    });
  }

  /**
   * Register a new discount strategy or override an existing one.
   */
  register(strategy: DiscountStrategy): void {
    const existingIdx = this.strategies.findIndex((s) => s.name === strategy.name);
    if (existingIdx >= 0) {
      this.strategies[existingIdx] = strategy;
    } else {
      this.strategies.push(strategy);
    }
    // Keep strategies sorted by priority ascending
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Find a strategy capable of handling the given discount.
   */
  findStrategy(discount: Discount): DiscountStrategy | undefined {
    return this.strategies.find((s) => s.name === discount.type);
  }

  /**
   * Return all registered strategies.
   */
  getStrategies(): ReadonlyArray<DiscountStrategy> {
    return [...this.strategies];
  }
}

/** Global singleton strategy registry. */
export const strategyRegistry = new DiscountStrategyRegistry();

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculates line item totals for a set of cart items.
 */
export function calculateSubtotal(items: CartItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const raw = items.reduce((sum, item) => {
    if (item.price < 0 || item.quantity <= 0) return sum;
    const itemDiscount = item.discountPercent ? Math.max(0, Math.min(100, item.discountPercent)) : 0;
    const itemTotal = item.price * item.quantity * (1 - itemDiscount / 100);
    return sum + itemTotal;
  }, 0);

  return Math.round(raw * 100) / 100;
}

/**
 * Calculates discount amounts for a given subtotal and array of discounts.
 *
 * Fixed in Issue #1:
 * Percentage discounts now compound sequentially against the running reduced subtotal,
 * rather than calculating against the fixed original subtotal.
 */
export function applyDiscounts(
  subtotal: number,
  discounts: Discount[]
): {
  appliedDiscounts: AppliedDiscount[];
  totalDiscount: number;
} {
  if (subtotal <= 0 || !Array.isArray(discounts) || discounts.length === 0) {
    return { appliedDiscounts: [], totalDiscount: 0 };
  }

  let runningSubtotal = subtotal;
  let totalDiscount = 0;
  const appliedDiscounts: AppliedDiscount[] = [];

  for (const discount of discounts) {
    // Validate minimum spend / subtotal requirement if set
    if (discount.minSubtotal !== undefined && subtotal < discount.minSubtotal) {
      continue;
    }

    // Validate discount value
    if (typeof discount.value !== 'number' || discount.value < 0 || isNaN(discount.value)) {
      continue;
    }

    if (runningSubtotal <= 0) break;

    const strategy = strategyRegistry.findStrategy(discount);
    if (!strategy) continue;

    // Apply strategy against the running reduced subtotal (compounding percentage discounts)
    const result = strategy.apply(runningSubtotal, discount);

    if (result.applied && result.amount > 0) {
      const actualAmount = Math.min(result.amount, runningSubtotal);
      const roundedAmount = Math.round(actualAmount * 100) / 100;

      runningSubtotal -= roundedAmount;
      totalDiscount += roundedAmount;

      appliedDiscounts.push({
        code: discount.code,
        amount: roundedAmount,
        type: discount.type,
      });
    }
  }

  return {
    appliedDiscounts,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
  };
}

/**
 * Calculates the complete cart summary including subtotal, discounts, and final total.
 */
export function calculateTotal(
  items: CartItem[],
  discounts: Discount[] = []
): CartSummary {
  const subtotal = calculateSubtotal(items);
  const { appliedDiscounts, totalDiscount } = applyDiscounts(subtotal, discounts);
  const finalTotal = Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);

  return {
    subtotal,
    appliedDiscounts,
    totalDiscount,
    finalTotal,
    itemCount: items.reduce((count, item) => count + (item.quantity > 0 ? item.quantity : 0), 0),
  };
}

/**
 * Calculates line total for a single item.
 */
export function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  discountPercent = 0
): number {
  if (unitPrice < 0 || quantity <= 0) return 0;

  const gross = unitPrice * quantity;
  const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
  const net = gross * (1 - clampedDiscount / 100);

  return Math.round(net * 100) / 100;
}

/**
 * Validates whether a discount code can be applied based on minimum spend requirements.
 */
export function canApplyDiscount(
  subtotal: number,
  discount: Discount
): { canApply: boolean; reason?: string } {
  if (typeof discount.value !== 'number' || discount.value < 0 || isNaN(discount.value)) {
    return { canApply: false, reason: 'Invalid discount value' };
  }

  if (discount.minSubtotal !== undefined && subtotal < discount.minSubtotal) {
    return {
      canApply: false,
      reason: `Minimum spend of $${discount.minSubtotal.toFixed(2)} required`,
    };
  }

  return { canApply: true };
}

// ============================================================================
// ShoppingCart Class (Public OOP API)
// ============================================================================

export class ShoppingCart {
  private items: CartItem[] = [];
  private discounts: Discount[] = [];

  addItem(item: CartItem): void {
    const existing = this.items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  removeItem(itemId: string): boolean {
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx >= 0) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

  applyDiscount(discount: Discount): boolean {
    const check = canApplyDiscount(this.getSubtotal(), discount);
    if (!check.canApply) return false;

    const exists = this.discounts.some((d) => d.code === discount.code);
    if (!exists) {
      this.discounts.push(discount);
      return true;
    }
    return false;
  }

  removeDiscount(code: string): boolean {
    const idx = this.discounts.findIndex((d) => d.code === code);
    if (idx >= 0) {
      this.discounts.splice(idx, 1);
      return true;
    }
    return false;
  }

  getSubtotal(): number {
    return calculateSubtotal(this.items);
  }

  getSummary(): CartSummary {
    return calculateTotal(this.items, this.discounts);
  }

  getItems(): ReadonlyArray<CartItem> {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
    this.discounts = [];
  }
}
