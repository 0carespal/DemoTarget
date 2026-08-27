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
 * Defines the type of discount applied.
 * - 'percentage': Discount applied as a percentage of subtotal or line item price.
 * - 'fixed': Discount applied as a fixed currency amount.
 */
export type DiscountType = 'percentage' | 'fixed';

/**
 * Target scope for a discount application.
 */
export type DiscountTarget = 'cart' | 'item' | 'shipping';

/**
 * Represents a discount configuration or applied discount rule.
 */
export interface Discount {
  type: DiscountType;
  value: number;
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
