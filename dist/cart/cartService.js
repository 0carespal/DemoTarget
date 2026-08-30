"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = exports.DiscountStrategyRegistry = exports.CouponExpirationDiscountStrategy = exports.BulkDiscountStrategy = exports.FixedAmountDiscountStrategy = exports.PercentageDiscountStrategy = void 0;
class PercentageDiscountStrategy {
    constructor() {
        this.type = 'percentage';
    }
    calculateDiscount(subtotal, _items, discount) {
        var _a, _b;
        const value = 'percentage' in discount ? discount.percentage : ((_b = (_a = discount.value) !== null && _a !== void 0 ? _a : discount.percentage) !== null && _b !== void 0 ? _b : 0);
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
        var _a, _b;
        const value = 'amount' in discount ? discount.amount : ((_b = (_a = discount.value) !== null && _a !== void 0 ? _a : discount.amount) !== null && _b !== void 0 ? _b : 0);
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
    calculateDiscount(_subtotal, items, discount) {
        var _a, _b, _c;
        const minQuantity = (_a = discount.minQuantity) !== null && _a !== void 0 ? _a : 1;
        const value = 'discountPercentage' in discount ? discount.discountPercentage : ((_c = (_b = discount.value) !== null && _b !== void 0 ? _b : discount.discountPercentage) !== null && _c !== void 0 ? _c : 0);
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
    calculateDiscount(subtotal, _items, discount) {
        var _a, _b, _c;
        if (!discount.expiresAt)
            return 0;
        const expirationTime = new Date(discount.expiresAt).getTime();
        if (isNaN(expirationTime))
            return 0;
        const now = Date.now();
        if (expirationTime <= now) {
            return 0;
        }
        const value = 'amount' in discount ? ((_a = discount.amount) !== null && _a !== void 0 ? _a : 0) : ((_c = (_b = discount.value) !== null && _b !== void 0 ? _b : discount.amount) !== null && _c !== void 0 ? _c : 0);
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
        this.registry = registry !== null && registry !== void 0 ? registry : new DiscountStrategyRegistry();
    }
    addItem(item) {
        const existingIndex = this.items.findIndex(i => i.id === item.id);
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += item.quantity;
        }
        else {
            this.items.push(Object.assign({}, item));
        }
    }
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }
    updateQuantity(itemId, quantity) {
        if (quantity <= 0) {
            this.removeItem(itemId);
            return;
        }
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
        }
    }
    applyDiscount(discount) {
        this.discounts.push(discount);
    }
    removeDiscount(discountId) {
        this.discounts = this.discounts.filter(d => ('id' in d ? d.id !== discountId : true));
    }
    clear() {
        this.items = [];
        this.discounts = [];
    }
    calculateSubtotal(items) {
        const targetItems = items !== null && items !== void 0 ? items : this.items;
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
        const targetItems = items !== null && items !== void 0 ? items : this.items;
        const targetRules = rules !== null && rules !== void 0 ? rules : this.discounts;
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
        const targetItems = items !== null && items !== void 0 ? items : this.items;
        const targetRules = rules !== null && rules !== void 0 ? rules : this.discounts;
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
        const appliedDiscounts = this.discounts.filter(d => 'id' in d);
        return {
            items: [...this.items],
            subtotal: result.subtotal,
            discount: result.discount,
            total: result.total,
            appliedDiscounts,
        };
    }
}
exports.CartService = CartService;
