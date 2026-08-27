import { CartItem, CartSummary, ShoppingCartOptions } from './types';
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
