export type Language = 'en' | 'kn';

export type UserRole = 'customer' | 'admin' | 'kitchen' | 'delivery';

export type OrderType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name_en: string;
  name_kn: string;
  slug: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name_en: string; // e.g. "Half", "Full", "2 Pieces", "Single"
  name_kn: string; // e.g. "ಅರ್ಧ", "ಪೂರ್ತಿ", "2 ರೊಟ್ಟಿ"
  price: number;
  is_default?: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name_en: string;
  name_kn: string;
  description_en: string;
  description_kn: string;
  base_price: number;
  image_url: string;
  is_veg: boolean; // 100% Pure Veg restaurant
  is_available: boolean;
  spice_level: 1 | 2 | 3; // 1: Mild, 2: Medium, 3: Dabha Spicy
  preparation_time_minutes: number;
  is_bestseller?: boolean;
  variants: ProductVariant[];
}

export interface Offer {
  id: string;
  code: string; // e.g. "ROTTI50", "FESTIVAL"
  title_en: string;
  title_kn: string;
  description_en: string;
  description_kn: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number; // e.g. 15 for 15% or 50 for flat ₹50
  min_order_amount: number;
  max_discount_amount?: number;
  is_active: boolean;
  banner_text_en?: string;
  banner_text_kn?: string;
  valid_until?: string;
}

export interface CartItem {
  id: string; // product_id + variant_id combo
  product: Product;
  selected_variant?: ProductVariant;
  quantity: number;
  special_instructions?: string;
}

export interface DeliveryAddress {
  id?: string;
  label: string; // 'Home', 'Work', 'Other'
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_en: string;
  product_name_kn: string;
  variant_name_en?: string;
  variant_name_kn?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicle_type: 'bike' | 'scooter';
  vehicle_number: string;
  status: 'available' | 'busy' | 'offline';
  current_lat?: number;
  current_lng?: number;
  last_updated?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. #BD-2041
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount_amount?: number;
  applied_coupon_code?: string;
  tax: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address?: DeliveryAddress;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  special_instructions?: string;
  assigned_driver?: DeliveryPartner;
  driver_lat?: number;
  driver_lng?: number;
  created_at: string;
  updated_at: string;
  acknowledged_by_admin: boolean;
  history?: OrderStatusHistoryItem[];
}

export interface RestaurantSettings {
  id: string;
  name_en: string;
  name_kn: string;
  tagline_en: string;
  tagline_kn: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  phone_primary: string;
  phone_secondary?: string;
  address_display_en: string;
  address_display_kn: string;
  delivery_fee_base: number;
  delivery_radius_km: number;
  free_delivery_above: number;
  tax_percentage: number;
  alarm_sound_enabled: boolean;
  alarm_interval_seconds: number;
}

export interface Review {
  id: string;
  order_id: string;
  customer_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}
