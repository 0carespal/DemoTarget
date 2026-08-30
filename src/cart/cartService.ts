import { CartItem, Discount, DiscountRule, CartSummary, DiscountStrategy } from './types';

export class PercentageDiscountStrategy implements DiscountStrategy {
  type = 'percentage';

  calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number {
    const value = 'percentage' in discount ? discount.percentage : (discount.value ?? discount.percentage ?? 0);
    if (value <= 0) return 0;
    const percentage = Math.min(value, 100);
    return Math.round(subtotal * (percentage / 100) * 100) / 100;
  }
}

export class FixedAmountDiscountStrategy implements DiscountStrategy {
  type = 'fixed';

  calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number {
    const value = 'amount' in discount ? discount.amount : (discount.value ?? discount.amount ?? 0);
    if (value <= 0) return 0;
    return Math.min(value, subtotal);
  }
}

export class BulkDiscountStrategy implements DiscountStrategy {
  type = 'bulk';

  calculateDiscount(_subtotal: number, items: CartItem[], discount: Discount | DiscountRule): number {
    const minQuantity = discount.minQuantity ?? 1;
    const value = 'discountPercentage' in discount ? discount.discountPercentage : (discount.value ?? discount.discountPercentage ?? 0);
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

  calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number {
    if (!discount.expiresAt) return 0;

    const expirationTime = new Date(discount.expiresAt).getTime();
    if (isNaN(expirationTime)) return 0;

    const now = Date.now();
    if (expirationTime <= now) {
      return 0;
    }

    const value = 'amount' in discount ? (discount.amount ?? 0) : (discount.value ?? discount.amount ?? 0);
    if (value <= 0) return 0;

    return Math.min(value, subtotal);
  }
}

export class DiscountStrategyRegistry {
  private strategies = new Map<string, DiscountStrategy>();

  constructor() {
    const fixedStrategy = new FixedAmountDiscountStrategy();
    this.register(new PercentageDiscountStrategy());
    this.register(fixedStrategy);
    // Register alias for 'fixed_amount' for backwards compatibility
    this.strategies.set('fixed_amount', fixedStrategy);
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
  private items: CartItem[] = [];
  private discounts: (Discount | DiscountRule)[] = [];
  private registry: DiscountStrategyRegistry;

  constructor(registry?: DiscountStrategyRegistry) {
    this.registry = registry ?? new DiscountStrategyRegistry();
  }

  addItem(item: CartItem): void {
    const existingIndex = this.items.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
    }
  }

  applyDiscount(discount: Discount | DiscountRule): void {
    this.discounts.push(discount);
  }

  removeDiscount(discountId: string): void {
    this.discounts = this.discounts.filter(d => ('id' in d ? d.id !== discountId : true));
  }

  clear(): void {
    this.items = [];
    this.discounts = [];
  }

  calculateSubtotal(items?: CartItem[]): number {
    const targetItems = items ?? this.items;
    if (!Array.isArray(targetItems)) return 0;

    let subtotal = 0;
    for (const item of targetItems) {
      if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') continue;
      if (!isFinite(item.price) || !isFinite(item.quantity)) continue;
      if (item.price < 0 || item.quantity <= 0) continue;
      subtotal += item.price * item.quantity;
    }
    return Math.round(subtotal * 100) / 100;
  }

  calculateDiscount(items?: CartItem[], rules?: (Discount | DiscountRule)[]): number {
    const targetItems = items ?? this.items;
    const targetRules = rules ?? this.discounts;

    const initialSubtotal = this.calculateSubtotal(targetItems);
    if (initialSubtotal <= 0 || !Array.isArray(targetRules)) return 0;

    let remainingSubtotal = initialSubtotal;
    let totalDiscount = 0;

    for (const rule of targetRules) {
      if (!rule || typeof rule.type !== 'string') continue;
      const strategy = this.registry.get(rule.type);
      if (strategy) {
        const discountAmount = strategy.calculateDiscount(remainingSubtotal, targetItems, rule);
        if (typeof discountAmount === 'number' && isFinite(discountAmount) && discountAmount > 0) {
          const actualDiscount = Math.min(discountAmount, remainingSubtotal);
          totalDiscount += actualDiscount;
          remainingSubtotal -= actualDiscount;
        }
      }
    }

    return Math.round(Math.min(totalDiscount, initialSubtotal) * 100) / 100;
  }

  calculateTotal(items?: CartItem[], rules?: (Discount | DiscountRule)[]): {
    subtotal: number;
    discount: number;
    total: number;
  } {
    const targetItems = items ?? this.items;
    const targetRules = rules ?? this.discounts;

    const subtotal = this.calculateSubtotal(targetItems);
    const discount = this.calculateDiscount(targetItems, targetRules);
    const total = Math.max(0, subtotal - discount);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  getSummary(): CartSummary {
    const result = this.calculateTotal();
    const appliedDiscounts = this.discounts.filter(d => 'id' in d) as Discount[];
    return {
      items: [...this.items],
      subtotal: result.subtotal,
      discount: result.discount,
      total: result.total,
      appliedDiscounts,
    };
  }
}
