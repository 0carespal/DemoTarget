/**
 * Represents an item in the shopping cart.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Supported discount type identifiers, including future extensibility.
 * - 'percentage': Percentage-based discount.
 * - 'fixed': Fixed monetary amount discount.
 * - 'buy_one_get_one': Buy-one-get-one promotion discount (for future implementation).
 * - 'coupon_expiration': Time-limited / expiring coupon discount (for future implementation).
 */
export type DiscountType =
  | 'percentage'
  | 'fixed'
  | 'buy_one_get_one'
  | 'coupon_expiration'
  | (string & {});

/**
 * Target scope for a discount application.
 */
export type DiscountTarget = 'cart' | 'item' | 'shipping';

/**
 * Base representation of a discount configuration or applied discount rule.
 */
export interface Discount {
  type: DiscountType;
  value?: number;
  code?: string;
  description?: string;
  target?: DiscountTarget;
  minSubtotal?: number;
  maxDiscountAmount?: number;
  /** @deprecated Retained for backwards compatibility with legacy service callers */
  percentage?: number;
}

/**
 * Specialized type for percentage-based discounts.
 */
export interface PercentageDiscount extends Discount {
  type: 'percentage';
  value: number;
}

/**
 * Specialized type for fixed amount discounts.
 */
export interface FixedDiscount extends Discount {
  type: 'fixed';
  value: number;
}

/**
 * Architecture readiness interface for future BOGO discount rules.
 */
export interface BOGODiscount extends Discount {
  type: 'buy_one_get_one';
  buyQuantity?: number;
  getQuantity?: number;
}

/**
 * Architecture readiness interface for future expiring coupon discount rules.
 */
export interface CouponExpirationDiscount extends Discount {
  type: 'coupon_expiration';
  expiresAt?: Date | string;
}

/**
 * Strategy interface for modular discount calculation strategies.
 */
export interface DiscountStrategy {
  readonly type: DiscountType;
  calculateDiscount(subtotal: number, discount: Discount): number;
}

/**
 * Contextual configuration used during pricing calculation.
 */
export interface PricingContext {
  currency?: string;
  customerTier?: string;
  appliedRules?: string[];
  taxRate?: number;
}

/**
 * Detailed price breakdown for an individual line item.
 */
export interface PriceBreakdownItem {
  itemId: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Comprehensive pricing calculation result produced by a pricing engine.
 */
export interface PricingCalculationResult {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  appliedDiscounts: Discount[];
  itemBreakdowns: PriceBreakdownItem[];
}

/**
 * Summary breakdown of shopping cart totals.
 */
export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  shippingAmount?: number;
}

/**
 * Options used to configure a ShoppingCart instance.
 */
export interface ShoppingCartOptions {
  taxRate?: number;
  currency?: string;
}
