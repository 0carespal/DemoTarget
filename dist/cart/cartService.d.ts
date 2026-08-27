import { CartItem, CartSummary, Discount, ShoppingCartOptions } from './types';
/**
 * Calculates the subtotal for a given array of cart items.
 *
 * @param items - Array of items in the cart
 * @returns Total price of all items before discounts
 */
export declare function calculateSubtotal(items: CartItem[]): number;
/**
 * Applies an array of discounts to a subtotal.
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
