from typing import Optional, List
from pydantic import BaseModel

class RestaurantSettingsModel(BaseModel):
    restaurant_name: str = "Basaveshwara Dabha"
    tagline: str = "Authentic Pure Vegetarian Flavours"
    logo_url: str = "/uploads/basaveshwara_logo.jpg"
    cover_image_url: str = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
    description: str = "Basaveshwara Dabha serves celebrated North & South Indian pure vegetarian delicacies, crafted with time-honoured spices and pure desi ghee."
    phone: str = "+91 98765 43210"
    email: str = "contact@basaveshwaradabha.com"
    address: str = "Main Road, Near Basaveshwara Circle, Bengaluru, Karnataka 560001"
    opening_time: str = "08:00"
    closing_time: str = "23:00"
    is_accepting_orders: bool = True
    closed_reason: Optional[str] = None
    min_order_value: float = 99.0
    delivery_fee: float = 35.0
    free_delivery_threshold: float = 499.0
    packaging_fee: float = 15.0
    tax_percentage: float = 5.0  # 5% GST
    is_pickup_available: bool = True
    is_delivery_available: bool = True
    weekly_off: Optional[str] = "None (Open 7 Days)"

    # Dedicated Customer Interface Header Customization
    header_top_announcement: str = "100% Pure Vegetarian Kitchen • Authentic Desi Ghee Flavours"
    header_notice: str = "Special Offers Available: Use WELCOME50 on checkout!"
    header_badge_text: str = "100% Pure Veg"
    header_show_announcement: bool = True
    header_show_phone: bool = True
    header_show_timings: bool = True
    header_tagline: str = "Authentic Pure Vegetarian Flavours"

    # Real UPI Payment Integration
    upi_id: str = "basaveshwaradabha@okaxis"
    upi_payee_name: str = "Basaveshwara Dabha"
    upi_qr_image_url: Optional[str] = None
    is_upi_enabled: bool = True

class RestaurantSettingsUpdate(BaseModel):
    restaurant_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_accepting_orders: Optional[bool] = None
    closed_reason: Optional[str] = None
    min_order_value: Optional[float] = None
    delivery_fee: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    packaging_fee: Optional[float] = None
    tax_percentage: Optional[float] = None
    is_pickup_available: Optional[bool] = None
    is_delivery_available: Optional[bool] = None
    weekly_off: Optional[str] = None

    # Header section fields
    header_top_announcement: Optional[str] = None
    header_notice: Optional[str] = None
    header_badge_text: Optional[str] = None
    header_show_announcement: Optional[bool] = None
    header_show_phone: Optional[bool] = None
    header_show_timings: Optional[bool] = None
    header_tagline: Optional[str] = None

    # UPI Payment fields
    upi_id: Optional[str] = None
    upi_payee_name: Optional[str] = None
    upi_qr_image_url: Optional[str] = None
    is_upi_enabled: Optional[bool] = None
