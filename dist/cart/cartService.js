"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingCart = void 0;
const validator_1 = require("../validation/validator");
class ShoppingCart {
    constructor(options) {
        this.items = new Map();
        this.discount = null;
        this.taxRate = options?.taxRate ?? 0;
        if (this.taxRate < 0) {
            throw new Error('Tax rate cannot be negative.');
        }
    }
    addItem(item) {
        const idValidation = validator_1.Validator.validateNonEmptyString(item.id, 'Item ID');
        const nameValidation = validator_1.Validator.validateNonEmptyString(item.name, 'Item Name');
        const priceValidation = validator_1.Validator.validatePositiveNumber(item.price, 'Item Price');
        const qtyValidation = validator_1.Validator.validatePositiveNumber(item.quantity, 'Item Quantity');
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
        }
        else {
            this.items.set(item.id, { ...item });
        }
    }
    removeItem(itemId) {
        return this.items.delete(itemId);
    }
    updateQuantity(itemId, newQuantity) {
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
    applyDiscountCode(code, percentage) {
        const codeVal = validator_1.Validator.validateNonEmptyString(code, 'Discount Code');
        const pctVal = validator_1.Validator.validatePercentage(percentage, 'Discount Percentage');
        const errors = [...codeVal.errors, ...pctVal.errors];
        if (errors.length > 0) {
            throw new Error(`Invalid discount: ${errors.join(' ')}`);
        }
        this.discount = { type: 'percentage', value: percentage, code, percentage };
    }
    clearDiscount() {
        this.discount = null;
    }
    getItems() {
        return Array.from(this.items.values()).map((item) => ({ ...item }));
    }
    getSummary() {
        let subtotal = 0;
        let itemCount = 0;
        for (const item of this.items.values()) {
            subtotal += item.price * item.quantity;
            itemCount += item.quantity;
        }
        const discountPercentage = this.discount
            ? this.discount.type === 'percentage'
                ? this.discount.value
                : (this.discount.percentage ?? 0)
            : 0;
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
    clearCart() {
        this.items.clear();
        this.discount = null;
    }
}
exports.ShoppingCart = ShoppingCart;
