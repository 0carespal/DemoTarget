"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = exports.DiscountStrategyRegistry = exports.CouponExpirationDiscountStrategy = exports.BulkDiscountStrategy = exports.FixedAmountDiscountStrategy = exports.PercentageDiscountStrategy = void 0;
class PercentageDiscountStrategy {
    constructor() {
        this.type = 'percentage';
    }
    calculateDiscount(subtotal, _items, rule) {
        var _a;
        const value = (_a = rule.value) !== null && _a !== void 0 ? _a : 0;
        if (value <= 0)
            return 0;
        const percentage = Math.min(value, 100);
        return Math.round(subtotal * (percentage / 100) * 100) / 100;
    }
}
exports.PercentageDiscountStrategy = PercentageDiscountStrategy;
class FixedAmountDiscountStrategy {
    constructor() {
        this.type = 'fixed_amount';
    }
    calculateDiscount(subtotal, _items, rule) {
        var _a;
        const value = (_a = rule.value) !== null && _a !== void 0 ? _a : 0;
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
    calculateDiscount(_subtotal, items, rule) {
        var _a, _b;
        const minQuantity = (_a = rule.minQuantity) !== null && _a !== void 0 ? _a : 1;
        const value = (_b = rule.value) !== null && _b !== void 0 ? _b : 0;
        if (value <= 0)
            return 0;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQuantity < minQuantity)
            return 0;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const percentage = Math.min(value, 100);
        return Math.round(subtotal * (percentage / 100) * 100) / 100;
    }
}
exports.BulkDiscountStrategy = BulkDiscountStrategy;
class CouponExpirationDiscountStrategy {
    constructor() {
        this.type = 'coupon_expiration';
    }
    calculateDiscount(subtotal, _items, rule) {
        var _a;
        if (!rule.expiresAt)
            return 0;
        const expirationTime = new Date(rule.expiresAt).getTime();
        if (isNaN(expirationTime))
            return 0;
        const now = Date.now();
        if (expirationTime < now) {
            return 0;
        }
        const value = (_a = rule.value) !== null && _a !== void 0 ? _a : 0;
        if (value <= 0)
            return 0;
        return Math.min(value, subtotal);
    }
}
exports.CouponExpirationDiscountStrategy = CouponExpirationDiscountStrategy;
class DiscountStrategyRegistry {
    constructor() {
        this.strategies = new Map();
        this.register(new PercentageDiscountStrategy());
        this.register(new FixedAmountDiscountStrategy());
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
        this.registry = registry !== null && registry !== void 0 ? registry : new DiscountStrategyRegistry();
    }
    calculateSubtotal(items) {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    calculateDiscount(items, rules) {
        const subtotal = this.calculateSubtotal(items);
        let totalDiscount = 0;
        for (const rule of rules) {
            const strategy = this.registry.get(rule.type);
            if (strategy) {
                totalDiscount += strategy.calculateDiscount(subtotal, items, rule);
            }
        }
        return Math.min(totalDiscount, subtotal);
    }
    calculateTotal(items, rules = []) {
        const subtotal = this.calculateSubtotal(items);
        const discount = this.calculateDiscount(items, rules);
        const total = Math.max(0, subtotal - discount);
        return {
            subtotal: Math.round(subtotal * 100) / 100,
            discount: Math.round(discount * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    }
}
exports.CartService = CartService;
