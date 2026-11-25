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
  created_at?: string;
  updated_at?: string;
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

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type FulfillmentType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

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
  table_number?: string;
  table_name?: string;
  delivery_address?: {
    title?: string;
    address_line: string;
    landmark?: string;
    city: string;
    pincode?: string;
  };
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
  used_count: number;
}

export interface CustomerStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  addresses: any[];
}

export interface AnalyticsDashboard {
  today_sales: number;
  today_orders: number;
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  pending_orders: number;
  accepted_orders: number;
  preparing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  best_selling_dishes: { name: string; units_sold: number }[];
  least_selling_dishes: { name: string; units_sold: number }[];
  payment_method_stats: Record<string, number>;
  recent_sales_chart: { date: string; sales: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILLING' | 'RESERVED';
export type ServiceRequestType = 'CALL_WAITER' | 'CLEAN_TABLE' | 'REQUEST_BILL' | 'WATER' | 'CUTLERY' | 'CUSTOM_SUGGESTION';

export interface RestaurantTable {
  id: string;
  table_number: string;
  table_name: string;
  capacity: number;
  section: string;
  status: TableStatus;
  is_active: boolean;
  active_order_count?: number;
  active_bill_total?: number;
  pending_requests_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TableServiceRequest {
  id: string;
  table_number: string;
  table_name: string;
  request_type: ServiceRequestType;
  customer_name?: string;
  order_id?: string;
  note?: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
  resolved_at?: string | null;
}
