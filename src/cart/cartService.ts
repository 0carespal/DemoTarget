import { CartItem, DiscountRule } from './types';

export interface DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export class PercentageDiscountStrategy implements DiscountStrategy {
  type = 'percentage';

  calculateDiscount(subtotal: number, _items: CartItem[], rule: DiscountRule): number {
    const value = rule.value ?? 0;
    if (value <= 0) return 0;
    const percentage = Math.min(value, 100);
    return Math.round(subtotal * (percentage / 100) * 100) / 100;
  }
}

export class FixedAmountDiscountStrategy implements DiscountStrategy {
  type = 'fixed_amount';

  calculateDiscount(subtotal: number, _items: CartItem[], rule: DiscountRule): number {
    const value = rule.value ?? 0;
    if (value <= 0) return 0;
    return Math.min(value, subtotal);
  }
}

export class BulkDiscountStrategy implements DiscountStrategy {
  type = 'bulk';

  calculateDiscount(_subtotal: number, items: CartItem[], rule: DiscountRule): number {
    const minQuantity = rule.minQuantity ?? 1;
    const value = rule.value ?? 0;
    if (value <= 0) return 0;

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity < minQuantity) return 0;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const percentage = Math.min(value, 100);
    return Math.round(subtotal * (percentage / 100) * 100) / 100;
  }
}

export class CouponExpirationDiscountStrategy implements DiscountStrategy {
  type = 'coupon_expiration';

  calculateDiscount(subtotal: number, _items: CartItem[], rule: DiscountRule): number {
    if (!rule.expiresAt) return 0;

    const expirationTime = new Date(rule.expiresAt).getTime();
    if (isNaN(expirationTime)) return 0;

    const now = Date.now();
    if (expirationTime < now) {
      return 0;
    }

    const value = rule.value ?? 0;
    if (value <= 0) return 0;

    return Math.min(value, subtotal);
  }
}

export class DiscountStrategyRegistry {
  private strategies = new Map<string, DiscountStrategy>();

  constructor() {
    this.register(new PercentageDiscountStrategy());
    this.register(new FixedAmountDiscountStrategy());
    this.register(new BulkDiscountStrategy());
    this.register(new CouponExpirationDiscountStrategy());
  }

  register(strategy: DiscountStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  get(type: string): DiscountStrategy | undefined {
    return this.strategies.get(type);
  }
}

export class CartService {
  private registry: DiscountStrategyRegistry;

  constructor(registry?: DiscountStrategyRegistry) {
    this.registry = registry ?? new DiscountStrategyRegistry();
  }

  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  calculateDiscount(items: CartItem[], rules: DiscountRule[]): number {
    const subtotal = this.calculateSubtotal(items);
    let totalDiscount = 0;

    for (const rule of rules) {
      const strategy = this.registry.get(rule.type);
      if (strategy) {
        totalDiscount += strategy.calculateDiscount(subtotal, items, rule);
      }
    }

    return Math.min(totalDiscount, subtotal);
  }

  calculateTotal(items: CartItem[], rules: DiscountRule[] = []): {
    subtotal: number;
    discount: number;
    total: number;
  } {
    const subtotal = this.calculateSubtotal(items);
    const discount = this.calculateDiscount(items, rules);
    const total = Math.max(0, subtotal - discount);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
