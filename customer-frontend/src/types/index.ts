export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  is_popular: boolean;
  is_today_special: boolean;
  preparation_time_minutes: number;
  spicy_level: number;
  calories?: number;
  portion_size?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface CartItem {
  id: string; // item id
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category?: string;
}

export interface Address {
  id?: string;
  title: string;
  address_line: string;
  landmark?: string;
  city: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  addresses: Address[];
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD' | 'DIRECT_QR';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type FulfillmentType = 'DELIVERY' | 'PICKUP';

export interface OrderItemDetail {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string;
  category?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  fulfillment_type: FulfillmentType;
  delivery_address?: Address;
  order_instructions?: string;
  items: OrderItemDetail[];
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  tax_amount: number;
  delivery_fee: number;
  packaging_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  upi_utr_number?: string;
  upi_app?: string;
  estimated_prep_time_minutes: number;
  rejection_reason?: string;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface RestaurantSettings {
  restaurant_name: string;
  tagline: string;
  logo_url: string;
  cover_image_url: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  opening_time: string;
  closing_time: string;
  is_accepting_orders: boolean;
  closed_reason?: string;
  min_order_value: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  packaging_fee: number;
  tax_percentage: number;
  is_pickup_available: boolean;
  is_delivery_available: boolean;
  weekly_off?: string;

  // Header customization fields
  header_top_announcement?: string;
  header_notice?: string;
  header_badge_text?: string;
  header_show_announcement?: boolean;
  header_show_phone?: boolean;
  header_show_timings?: boolean;
  header_tagline?: string;

  // Real UPI Payment settings
  upi_id?: string;
  upi_payee_name?: string;
  upi_qr_image_url?: string;
  is_upi_enabled?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount: number;
  is_active: boolean;
}
