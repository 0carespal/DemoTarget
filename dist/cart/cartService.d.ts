import { CartItem, Discount, DiscountRule, CartSummary, DiscountStrategy } from './types';

export declare class PercentageDiscountStrategy implements DiscountStrategy {
    type: string;
    calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number;
}
export declare class FixedAmountDiscountStrategy implements DiscountStrategy {
    type: string;
    calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number;
}
export declare class BulkDiscountStrategy implements DiscountStrategy {
    type: string;
    calculateDiscount(subtotal: number, items: CartItem[], discount: Discount | DiscountRule): number;
}
export declare class CouponExpirationDiscountStrategy implements DiscountStrategy {
    type: string;
    calculateDiscount(subtotal: number, _items: CartItem[], discount: Discount | DiscountRule): number;
}
export declare class DiscountStrategyRegistry {
    private strategies;
    constructor();
    register(strategy: DiscountStrategy): void;
    get(type: string): DiscountStrategy | undefined;
}
export declare class CartService {
    private items;
    private discounts;
    private registry;
    constructor(registry?: DiscountStrategyRegistry);
    addItem(item: CartItem): void;
    removeItem(itemId: string): void;
    updateQuantity(itemId: string, quantity: number): void;
    applyDiscount(discount: Discount | DiscountRule): void;
    removeDiscount(discountId: string): void;
    clear(): void;
    calculateSubtotal(items?: CartItem[]): number;
    calculateDiscount(items?: CartItem[], rules?: (Discount | DiscountRule)[]): number;
    calculateTotal(items?: CartItem[], rules?: (Discount | DiscountRule)[]): {
        subtotal: number;
        discount: number;
        total: number;
    };
    getSummary(): CartSummary;
}
