import { CartItem, DiscountRule } from './types';

export interface DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export declare class PercentageDiscountStrategy implements DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export declare class FixedAmountDiscountStrategy implements DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export declare class BulkDiscountStrategy implements DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export declare class CouponExpirationDiscountStrategy implements DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], rule: DiscountRule): number;
}

export declare class DiscountStrategyRegistry {
  private strategies;
  constructor();
  register(strategy: DiscountStrategy): void;
  get(type: string): DiscountStrategy | undefined;
}

export declare class CartService {
  private registry;
  constructor(registry?: DiscountStrategyRegistry);
  calculateSubtotal(items: CartItem[]): number;
  calculateDiscount(items: CartItem[], rules: DiscountRule[]): number;
  calculateTotal(items: CartItem[], rules?: DiscountRule[]): {
    subtotal: number;
    discount: number;
    total: number;
  };
}
