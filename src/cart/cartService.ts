import {
  CartItem,
  Discount,
  DiscountResult,
  AppliedDiscount,
  CartSummary,
  CartOperationResult,
} from './types';

export class CartService {
  private items: CartItem[] = [];
  private appliedDiscounts: Discount[] = [];

  /**
   * Add an item to the cart
   */
  addItem(item: CartItem): CartOperationResult<CartSummary> {
    if (!item.id || item.id.trim() === '') {
      return { success: false, error: 'Item ID is required' };
    }

    if (item.price < 0) {
      return { success: false, error: 'Item price cannot be negative' };
    }

    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      return { success: false, error: 'Quantity must be a positive integer' };
    }

    const existingIndex = this.items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }

    return { success: true, data: this.getSummary() };
  }

  /**
   * Remove an item from the cart by ID
   */
  removeItem(itemId: string): CartOperationResult<CartSummary> {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== itemId);

    if (this.items.length === initialLength) {
      return { success: false, error: `Item with ID "${itemId}" not found` };
    }

    return { success: true, data: this.getSummary() };
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): CartOperationResult<CartSummary> {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, error: 'Quantity must be a positive integer' };
    }

    const item = this.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, error: `Item with ID "${itemId}" not found` };
    }

    item.quantity = quantity;
    return { success: true, data: this.getSummary() };
  }

  /**
   * Apply a discount code/rule to the cart
   */
  applyDiscount(discount: Discount): CartOperationResult<CartSummary> {
    if (!discount.code || discount.code.trim() === '') {
      return { success: false, error: 'Discount code is required' };
    }

    if (discount.value <= 0) {
      return { success: false, error: 'Discount value must be greater than zero' };
    }

    if (discount.type === 'percentage' && discount.value > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%' };
    }

    // Check if discount already applied
    const alreadyApplied = this.appliedDiscounts.some((d) => d.code === discount.code);
    if (alreadyApplied) {
      return { success: false, error: `Discount code "${discount.code}" has already been applied` };
    }

    this.appliedDiscounts.push({ ...discount });
    return { success: true, data: this.getSummary() };
  }

  /**
   * Remove a discount by code
   */
  removeDiscount(code: string): CartOperationResult<CartSummary> {
    const initialLength = this.appliedDiscounts.length;
    this.appliedDiscounts = this.appliedDiscounts.filter((d) => d.code !== code);

    if (this.appliedDiscounts.length === initialLength) {
      return { success: false, error: `Discount code "${code}" not found` };
    }

    return { success: true, data: this.getSummary() };
  }

  /**
   * Calculate subtotal (sum of item prices * quantities)
   */
  calculateSubtotal(): number {
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.round(subtotal * 100) / 100;
  }

  /**
   * Calculate applied discounts against subtotal
   */
  calculateDiscounts(subtotal: number, discounts: Discount[]): DiscountResult {
    let currentSubtotal = subtotal;
    let totalSavings = 0;
    const applied: AppliedDiscount[] = [];

    for (const discount of discounts) {
      let discountAmount = 0;

      switch (discount.type) {
        case 'fixed': {
          discountAmount = discount.value;
          break;
        }
        case 'percentage': {
          discountAmount = (currentSubtotal * discount.value) / 100;
          break;
        }
        case 'buy_x_get_y': {
          // BOGO discount logic calculated separately per item
          if (discount.targetItemId) {
            const item = this.items.find((i) => i.id === discount.targetItemId);
            if (item && discount.requiredQuantity && discount.freeQuantity) {
              const sets = Math.floor(item.quantity / discount.requiredQuantity);
              discountAmount = sets * discount.freeQuantity * item.price;
            }
          }
          break;
        }
      }

      // Ensure single discount doesn't exceed current subtotal
      discountAmount = Math.min(discountAmount, currentSubtotal);
      discountAmount = Math.round(discountAmount * 100) / 100;

      if (discountAmount > 0) {
        applied.push({
          code: discount.code,
          type: discount.type,
          amountSaved: discountAmount,
        });

        currentSubtotal -= discountAmount;
        totalSavings += discountAmount;
      }
    }

    const finalTotal = Math.max(0, Math.round((subtotal - totalSavings) * 100) / 100);

    return {
      subtotal,
      totalSavings: Math.round(totalSavings * 100) / 100,
      finalTotal,
      appliedDiscounts: applied,
    };
  }

  /**
   * Get complete summary of current cart state
   */
  getSummary(): CartSummary {
    const subtotal = this.calculateSubtotal();
    const discountResult = this.calculateDiscounts(subtotal, this.appliedDiscounts);
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: [...this.items],
      itemCount,
      subtotal,
      totalSavings: discountResult.totalSavings,
      finalTotal: discountResult.finalTotal,
      appliedDiscounts: discountResult.appliedDiscounts,
    };
  }

  /**
   * Clear all items and discounts
   */
  clear(): void {
    this.items = [];
    this.appliedDiscounts = [];
  }
}
