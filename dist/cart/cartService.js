"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingCart = exports.calculateCartTotal = exports.calculateCartDiscount = exports.calculateCartSubtotal = exports.CartService = exports.DiscountStrategyRegistry = exports.CouponExpirationDiscountStrategy = exports.BulkDiscountStrategy = exports.FixedAmountDiscountStrategy = exports.PercentageDiscountStrategy = void 0;
class PercentageDiscountStrategy {
    constructor() {
        this.type = 'percentage';
    }
    calculateDiscount(subtotal, _items, discount) {
        const value = ('percentage' in discount && discount.percentage !== undefined)
            ? discount.percentage
            : (discount.value ?? discount.percentage ?? 0);
        if (value <= 0)
            return 0;
        const percentage = Math.min(value, 100);
        return Math.round(subtotal * (percentage / 100) * 100) / 100;
    }
}
exports.PercentageDiscountStrategy = PercentageDiscountStrategy;
class FixedAmountDiscountStrategy {
    constructor() {
        this.type = 'fixed';
    }
    calculateDiscount(subtotal, _items, discount) {
        const value = ('amount' in discount && discount.amount !== undefined)
            ? discount.amount
            : (discount.value ?? discount.amount ?? 0);
        if (value <= 0)
            return 0;
        return Math.min(value, subtotal);
    }
}
exports.FixedAmountDiscountStrategy = FixedAmountDiscountStrategy;
class BulkDiscountStrategy {
    constructor() {
        this.type = 'bulk';
    }
    calculateDiscount(subtotal, items, discount) {
        const minQuantity = discount.minQuantity ?? 1;
        const value = ('discountPercentage' in discount && discount.discountPercentage !== undefined)
            ? discount.discountPercentage
            : (discount.value ?? discount.discountPercentage ?? 0);
        if (value <= 0)
            return 0;
        let validQuantity = 0;
        for (const item of items) {
            if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number')
                continue;
            if (!isFinite(item.price) || !isFinite(item.quantity))
                continue;
            if (item.price < 0 || item.quantity <= 0)
                continue;
            validQuantity += item.quantity;
        }
        if (validQuantity < minQuantity)
            return 0;
        const percentage = Math.min(value, 100);
        return Math.round(subtotal * (percentage / 100) * 100) / 100;
    }
}
exports.BulkDiscountStrategy = BulkDiscountStrategy;
class CouponExpirationDiscountStrategy {
    constructor() {
        this.type = 'coupon_expiration';
    }
    calculateDiscount(subtotal, _items, discount) {
        if (!discount.expiresAt)
            return 0;
        const expirationTime = new Date(discount.expiresAt).getTime();
        if (isNaN(expirationTime))
            return 0;
        const now = Date.now();
        if (expirationTime <= now) {
            return 0;
        }
        const value = ('amount' in discount && discount.amount !== undefined)
            ? discount.amount
            : (discount.value ?? discount.amount ?? 0);
        if (value <= 0)
            return 0;
        return Math.min(value, subtotal);
    }
}
exports.CouponExpirationDiscountStrategy = CouponExpirationDiscountStrategy;
class DiscountStrategyRegistry {
    constructor() {
        this.strategies = new Map();
        const fixedStrategy = new FixedAmountDiscountStrategy();
        this.register(new PercentageDiscountStrategy());
        this.register(fixedStrategy);
        this.strategies.set('fixed_amount', fixedStrategy);
        this.register(new BulkDiscountStrategy());
        this.register(new CouponExpirationDiscountStrategy());
    }
    register(strategy) {
        this.strategies.set(strategy.type, strategy);
    }
    get(type) {
        return this.strategies.get(type);
    }
}
exports.DiscountStrategyRegistry = DiscountStrategyRegistry;
class CartService {
    constructor(registry) {
        this.items = [];
        this.discounts = [];
        this.registry = registry ?? new DiscountStrategyRegistry();
    }
    addItem(item) {
        if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number')
            return;
        if (!isFinite(item.price) || !isFinite(item.quantity))
            return;
        if (item.price < 0 || item.quantity <= 0 || !Number.isInteger(item.quantity))
            return;
        const existingIndex = this.items.findIndex(i => i.id === item.id);
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += item.quantity;
        }
        else {
            this.items.push({ ...item });
        }
    }
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }
    updateQuantity(itemId, quantity) {
        if (typeof quantity !== 'number' || !isFinite(quantity)) {
            return;
        }
        if (quantity === 0) {
            this.removeItem(itemId);
            return;
        }
        if (quantity < 0 || !Number.isInteger(quantity)) {
            return;
        }
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
        }
    }
    applyDiscount(discount) {
        if (!discount || typeof discount.type !== 'string')
            return;
        const discountCopy = JSON.parse(JSON.stringify(discount));
        if (!discountCopy.id) {
            discountCopy.id = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        this.discounts.push(discountCopy);
    }
    removeDiscount(discountId) {
        this.discounts = this.discounts.filter(d => d.id !== discountId);
    }
    clear() {
        this.items = [];
        this.discounts = [];
    }
    calculateSubtotal(items) {
        const targetItems = items ?? this.items;
        if (!Array.isArray(targetItems))
            return 0;
        let subtotal = 0;
        for (const item of targetItems) {
            if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number')
                continue;
            if (!isFinite(item.price) || !isFinite(item.quantity))
                continue;
            if (item.price < 0 || item.quantity <= 0)
                continue;
            subtotal += item.price * item.quantity;
        }
        return Math.round(subtotal * 100) / 100;
    }
    calculateDiscount(items, rules) {
        const targetItems = items ?? this.items;
        const targetRules = rules ?? this.discounts;
        const initialSubtotal = this.calculateSubtotal(targetItems);
        if (initialSubtotal <= 0 || !Array.isArray(targetRules))
            return 0;
        let remainingSubtotal = initialSubtotal;
        let totalDiscount = 0;
        for (const rule of targetRules) {
            if (!rule || typeof rule.type !== 'string')
                continue;
            const strategy = this.registry.get(rule.type);
            if (strategy) {
                const discountAmount = strategy.calculateDiscount(remainingSubtotal, targetItems, rule);
                if (typeof discountAmount === 'number' && isFinite(discountAmount) && discountAmount > 0) {
                    const actualDiscount = Math.min(discountAmount, remainingSubtotal);
                    totalDiscount += actualDiscount;
                    remainingSubtotal -= actualDiscount;
                }
            }
        }
        return Math.round(Math.min(totalDiscount, initialSubtotal) * 100) / 100;
    }
    calculateTotal(items, rules) {
        const targetItems = items ?? this.items;
        const targetRules = rules ?? this.discounts;
        const subtotal = this.calculateSubtotal(targetItems);
        const discount = this.calculateDiscount(targetItems, targetRules);
        const total = Math.max(0, subtotal - discount);
        return {
            subtotal: Math.round(subtotal * 100) / 100,
            discount: Math.round(discount * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    }
    getSummary() {
        const result = this.calculateTotal();
        const appliedDiscounts = JSON.parse(JSON.stringify(this.discounts));
        const itemsCopy = JSON.parse(JSON.stringify(this.items));
        return {
            items: itemsCopy,
            subtotal: result.subtotal,
            discount: result.discount,
            total: result.total,
            appliedDiscounts,
        };
    }
}
exports.CartService = CartService;
const calculateCartSubtotal = (items) => {
    return new CartService().calculateSubtotal(items);
};
exports.calculateCartSubtotal = calculateCartSubtotal;
const calculateCartDiscount = (items, rules) => {
    return new CartService().calculateDiscount(items, rules);
};
exports.calculateCartDiscount = calculateCartDiscount;
const calculateCartTotal = (items, rules) => {
    return new CartService().calculateTotal(items, rules);
};
exports.calculateCartTotal = calculateCartTotal;
class ShoppingCart extends CartService {
}
exports.ShoppingCart = ShoppingCart;
