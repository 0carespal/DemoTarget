import { Discount, CartSummary, DiscountApplicationResult } from './types';

/**
 * Calculates discount amounts for a given subtotal and array of discounts.
 *
 * Requirements:
 * 1. Percentage discounts apply sequentially to the running reduced subtotal,
 *    NOT the original fixed subtotal.
 * 2. Fixed-amount discounts apply directly to reduce the running total.
 * 3. The total discount amount returned must not exceed the original subtotal
 *    (i.e. final payable total cannot drop below 0).
 * 4. Invalid or inactive discounts are skipped and reported in details.
 */
export function applyDiscounts(
  subtotal: number,
  discounts: Discount[]
): CartSummary {
  if (subtotal <= 0) {
    return {
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      appliedDiscounts: [],
    };
  }

  let runningSubtotal = subtotal;
  let totalDiscount = 0;
  const appliedDiscounts: DiscountApplicationResult[] = [];

  for (const discount of discounts) {
    if (!discount.isActive) {
      appliedDiscounts.push({
        discount,
        amountApplied: 0,
        status: 'SKIPPED',
        reason: 'Discount is inactive',
      });
      continue;
    }

    if (runningSubtotal <= 0) {
      appliedDiscounts.push({
        discount,
        amountApplied: 0,
        status: 'SKIPPED',
        reason: 'Subtotal is already zero',
      });
      continue;
    }

    let discountAmount = 0;

    if (discount.type === 'PERCENTAGE') {
      // Calculate percentage against the running reduced subtotal
      discountAmount = (runningSubtotal * discount.value) / 100;
    } else if (discount.type === 'FIXED') {
      discountAmount = discount.value;
    }

    // Ensure discount amount does not exceed the remaining running subtotal
    discountAmount = Math.min(discountAmount, runningSubtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    runningSubtotal -= discountAmount;
    totalDiscount += discountAmount;

    appliedDiscounts.push({
      discount,
      amountApplied: discountAmount,
      status: 'APPLIED',
    });
  }

  totalDiscount = Math.round(totalDiscount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);

  return {
    subtotal,
    totalDiscount,
    finalTotal,
    appliedDiscounts,
  };
}

/**
 * Calculates line item totals, applying line-level discounts if present.
 */
export function calculateLineTotal(
  unitPrice: number,
  quantity: number,
  discountPercent = 0
): number {
  if (unitPrice < 0 || quantity <= 0) return 0;

  const gross = unitPrice * quantity;
  const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
  const net = gross * (1 - clampedDiscount / 100);

  return Math.round(net * 100) / 100;
}

/**
 * Validates whether a discount code can be applied based on minimum spend requirements.
 */
export function canApplyDiscount(
  subtotal: number,
  discount: Discount
): { canApply: boolean; reason?: string } {
  if (!discount.isActive) {
    return { canApply: false, reason: 'Discount is inactive' };
  }

  if (discount.minimumSpend && subtotal < discount.minimumSpend) {
    return {
      canApply: false,
      reason: `Minimum spend of $${discount.minimumSpend.toFixed(2)} required`,
    };
  }

  return { canApply: true };
}
