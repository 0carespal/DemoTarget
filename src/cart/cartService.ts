import { CartItem, CartSummary, Discount, ShoppingCartOptions } from './types';
import { Validator } from '../validation/validator';

/**
 * Calculates the subtotal for a given array of cart items.
 *
 * @param items - Array of items in the cart
 * @returns Total price of all items before discounts
 */
export function calculateSubtotal(items: CartItem[]): number {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array.');
  }

  let subtotal = 0;

  for (const item of items) {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new Error('Invalid item structure.');
    }
    if (item.price < 0 || item.quantity < 0) {
      throw new Error('Item price and quantity must be non-negative.');
    }
    subtotal += item.price * item.quantity;
  }

  return Number(subtotal.toFixed(2));
}

/**
 * Applies an array of discounts to a subtotal.
 *
 * @param subtotal - The base subtotal amount
 * @param discounts - Array of discounts to apply
 * @returns Total amount after applying discounts
 */
export function applyDiscounts(subtotal: number, discounts: Discount[]): number {
  if (typeof subtotal !== 'number' || isNaN(subtotal) || subtotal < 0) {
    throw new Error('Subtotal must be a non-negative number.');
  }

  if (!Array.isArray(discounts)) {
    throw new Error('Discounts must be an array.');
  }

  let totalDiscount = 0;

  for (const discount of discounts) {
    if (!discount || typeof discount.value !== 'number' || discount.value < 0) {
      throw new Error('Invalid discount value.');
    }

    if (discount.type === 'percentage') {
      totalDiscount += (subtotal * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      totalDiscount += discount.value;
    }
  }

  return Number(Math.max(0, subtotal - totalDiscount).toFixed(2));
}

/**
 * Calculates the final total for items and applied discounts.
 *
 * @param items - Array of items in the cart
 * @param discounts - Array of discounts to apply
 * @returns Final total price after subtotal calculation and discount application
 */
export function calculateTotal(items: CartItem[], discounts: Discount[] = []): number {
  const subtotal = calculateSubtotal(items);
  return applyDiscounts(subtotal, discounts);
}

/**
 * State Management class for shopping cart operations.
 */
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

    this.discount = { type: 'percentage', value: percentage, code, percentage };
  }

  public clearDiscount(): void {
    this.discount = null;
  }

  public getItems(): CartItem[] {
    return Array.from(this.items.values()).map((item) => ({ ...item }));
  }

  public getSummary(): CartSummary {
    const items = this.getItems();
    const subtotal = calculateSubtotal(items);
    const discounts = this.discount ? [this.discount] : [];
    const discountedTotal = applyDiscounts(subtotal, discounts);
    const discountAmount = Number((subtotal - discountedTotal).toFixed(2));
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number((taxableSubtotal * this.taxRate).toFixed(2));
    const total = Number((taxableSubtotal + taxAmount).toFixed(2));

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
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
