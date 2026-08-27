import { CartItem, CartSummary, Discount, ShoppingCartOptions } from './types';
import { Validator } from '../validation/validator';

export class ShoppingCart {
  private items: Map<string, CartItem> = new Map();
  private discount: Discount | null = null;
  private taxRate: number;

  constructor(options?: ShoppingCartOptions) {
    this.taxRate = options?.taxRate ?? 0;
    if (this.taxRate < 0) {
      throw new Error('Tax rate cannot be negative.');
    }
  }

  public addItem(item: CartItem): void {
    const idValidation = Validator.validateNonEmptyString(item.id, 'Item ID');
    const nameValidation = Validator.validateNonEmptyString(item.name, 'Item Name');
    const priceValidation = Validator.validatePositiveNumber(item.price, 'Item Price');
    const qtyValidation = Validator.validatePositiveNumber(item.quantity, 'Item Quantity');

    const allErrors = [
      ...idValidation.errors,
      ...nameValidation.errors,
      ...priceValidation.errors,
      ...qtyValidation.errors,
    ];

    if (allErrors.length > 0) {
      throw new Error(`Invalid item: ${allErrors.join(' ')}`);
    }

    const existingItem = this.items.get(item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }
  }

  public removeItem(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  public updateQuantity(itemId: string, newQuantity: number): void {
    const existing = this.items.get(itemId);
    if (!existing) {
      throw new Error(`Item with ID ${itemId} not found in cart.`);
    }

    if (newQuantity <= 0) {
      this.items.delete(itemId);
      return;
    }

    existing.quantity = newQuantity;
  }

  public applyDiscountCode(code: string, percentage: number): void {
    const codeVal = Validator.validateNonEmptyString(code, 'Discount Code');
    const pctVal = Validator.validatePercentage(percentage, 'Discount Percentage');

    const errors = [...codeVal.errors, ...pctVal.errors];
    if (errors.length > 0) {
      throw new Error(`Invalid discount: ${errors.join(' ')}`);
    }

    this.discount = { code, percentage };
  }

  public clearDiscount(): void {
    this.discount = null;
  }

  public getItems(): CartItem[] {
    return Array.from(this.items.values()).map((item) => ({ ...item }));
  }

  public getSummary(): CartSummary {
    let subtotal = 0;
    let itemCount = 0;

    for (const item of this.items.values()) {
      subtotal += item.price * item.quantity;
      itemCount += item.quantity;
    }

    const discountPercentage = this.discount ? this.discount.percentage : 0;
    const discountAmount = Number(((subtotal * discountPercentage) / 100).toFixed(2));
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number((taxableSubtotal * this.taxRate).toFixed(2));
    const total = Number((taxableSubtotal + taxAmount).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount,
      taxAmount,
      total,
      itemCount,
    };
  }

  public clearCart(): void {
    this.items.clear();
    this.discount = null;
  }
}
