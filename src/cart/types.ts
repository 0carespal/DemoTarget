export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type DiscountType = 'percentage' | 'fixed' | 'bulk' | 'coupon_expiration';

export interface BaseDiscount {
  id: string;
  type: DiscountType;
  code?: string;
}

export interface PercentageDiscount extends BaseDiscount {
  type: 'percentage';
  percentage: number;
}

export interface FixedDiscount extends BaseDiscount {
  type: 'fixed';
  amount: number;
}

export interface BulkDiscount extends BaseDiscount {
  type: 'bulk';
  minQuantity: number;
  discountPercentage: number;
}

export interface CouponExpirationDiscount extends BaseDiscount {
  type: 'coupon_expiration';
  amount?: number;
  expiresAt: string;
}

export type Discount = PercentageDiscount | FixedDiscount | BulkDiscount | CouponExpirationDiscount;

// For strategy calculations where a rule object can represent any discount variant
export interface DiscountRule {
  id?: string;
  type: string;
  value?: number;
  amount?: number;
  percentage?: number;
  minQuantity?: number;
  discountPercentage?: number;
  expiresAt?: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  appliedDiscounts: Discount[];
}

export interface DiscountStrategy {
  type: string;
  calculateDiscount(subtotal: number, items: CartItem[], discount: Discount | DiscountRule): number;
}
