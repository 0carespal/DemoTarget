import { CartItem, CartSummary, Discount, DiscountStrategy, DiscountType, ShoppingCartOptions } from './types';
/**
 * Strategy implementation for calculating percentage-based discounts.
 */
export declare class PercentageDiscountStrategy implements DiscountStrategy {
    readonly type: DiscountType;
    calculateDiscount(subtotal: number, discount: Discount): number;
}
/**
 * Strategy implementation for calculating fixed amount discounts.
 */
export declare class FixedDiscountStrategy implements DiscountStrategy {
    readonly type: DiscountType;
    calculateDiscount(_subtotal: number, discount: Discount): number;
}
/**
 * Registry mapping discount types to their corresponding calculation strategies.
 * Allows adding new discount strategies (e.g. buy_one_get_one, coupon_expiration) dynamically.
 */
export declare class DiscountStrategyRegistry {
    private static strategies;
    /**
     * Registers a discount calculation strategy.
     * @param strategy - DiscountStrategy implementation to register
     */
    static registerStrategy(strategy: DiscountStrategy): void;
    /**
     * Retrieves the registered strategy for a given discount type.
     * @param type - DiscountType identifier
     */
    static getStrategy(type: DiscountType): DiscountStrategy | undefined;
}
/**
 * Calculates the subtotal for a given array of cart items.
 *
 * @param items - Array of items in the cart
 * @returns Total price of all items before discounts
 */
export declare function calculateSubtotal(items: CartItem[]): number;
/**
 * Applies an array of discounts to a subtotal using modular discount strategies.
 *
 * @param subtotal - The base subtotal amount
 * @param discounts - Array of discounts to apply
 * @returns Total amount after applying discounts
 */
export declare function applyDiscounts(subtotal: number, discounts: Discount[]): number;
/**
 * Calculates the final total for items and applied discounts.
 *
 * @param items - Array of items in the cart
 * @param discounts - Array of discounts to apply
 * @returns Final total price after subtotal calculation and discount application
 */
export declare function calculateTotal(items: CartItem[], discounts?: Discount[]): number;
/**
 * State Management class for shopping cart operations.
 */
export declare class ShoppingCart {
    private items;
    private discount;
    private taxRate;
    constructor(options?: ShoppingCartOptions);
    addItem(item: CartItem): void;
    removeItem(itemId: string): boolean;
    updateQuantity(itemId: string, newQuantity: number): void;
    applyDiscountCode(code: string, percentage: number): void;
    clearDiscount(): void;
    getItems(): CartItem[];
    getSummary(): CartSummary;
    clearCart(): void;
}
