"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingCart = exports.DiscountStrategyRegistry = exports.FixedDiscountStrategy = exports.PercentageDiscountStrategy = void 0;
exports.calculateSubtotal = calculateSubtotal;
exports.applyDiscounts = applyDiscounts;
exports.calculateTotal = calculateTotal;
const validator_1 = require("../validation/validator");
/**
 * Strategy implementation for calculating percentage-based discounts.
 */
class PercentageDiscountStrategy {
    constructor() {
        this.type = 'percentage';
    }
    calculateDiscount(subtotal, discount) {
        const val = discount.value ?? discount.percentage ?? 0;
        return (subtotal * val) / 100;
    }
}
exports.PercentageDiscountStrategy = PercentageDiscountStrategy;
/**
 * Strategy implementation for calculating fixed amount discounts.
 */
class FixedDiscountStrategy {
    constructor() {
        this.type = 'fixed';
    }
    calculateDiscount(_subtotal, discount) {
        return discount.value ?? 0;
    }
}
exports.FixedDiscountStrategy = FixedDiscountStrategy;
/**
 * Registry mapping discount types to their corresponding calculation strategies.
 * Allows adding new discount strategies (e.g. buy_one_get_one, coupon_expiration) dynamically.
 */
class DiscountStrategyRegistry {
    /**
     * Registers a discount calculation strategy.
     * @param strategy - DiscountStrategy implementation to register
     */
    static registerStrategy(strategy) {
        this.strategies.set(strategy.type, strategy);
    }
    /**
     * Retrieves the registered strategy for a given discount type.
     * @param type - DiscountType identifier
     */
    static getStrategy(type) {
        return this.strategies.get(type);
    }
}
exports.DiscountStrategyRegistry = DiscountStrategyRegistry;
DiscountStrategyRegistry.strategies = new Map();
(() => {
    DiscountStrategyRegistry.registerStrategy(new PercentageDiscountStrategy());
    DiscountStrategyRegistry.registerStrategy(new FixedDiscountStrategy());
})();
/**
 * Calculates the subtotal for a given array of cart items.
 *
 * @param items - Array of items in the cart
 * @returns Total price of all items before discounts
 */
function calculateSubtotal(items) {
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
 * Applies an array of discounts to a subtotal using modular discount strategies.
 *
 * @param subtotal - The base subtotal amount
 * @param discounts - Array of discounts to apply
 * @returns Total amount after applying discounts
 */
function applyDiscounts(subtotal, discounts) {
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
        const strategy = DiscountStrategyRegistry.getStrategy(discount.type);
        if (strategy) {
            totalDiscount += strategy.calculateDiscount(subtotal, discount);
        }
        else {
            // Fallback for direct built-in discount types
            if (discount.type === 'percentage') {
                totalDiscount += (subtotal * discount.value) / 100;
            }
            else if (discount.type === 'fixed') {
                totalDiscount += discount.value;
            }
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
function calculateTotal(items, discounts = []) {
    const subtotal = calculateSubtotal(items);
    return applyDiscounts(subtotal, discounts);
}
/**
 * State Management class for shopping cart operations.
 */
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
    clearCart() {
        this.items.clear();
        this.discount = null;
    }
}
exports.ShoppingCart = ShoppingCart;
