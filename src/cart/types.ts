export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Discount {
  code: string;
  percentage: number;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

export interface ShoppingCartOptions {
  taxRate?: number;
}
