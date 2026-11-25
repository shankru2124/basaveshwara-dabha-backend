from typing import Optional, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class OrderStatus(str, Enum):
    PLACED = "PLACED"
    ACCEPTED = "ACCEPTED"
    PREPARING = "PREPARING"
    READY = "READY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class PaymentMethod(str, Enum):
    RAZORPAY_UPI = "RAZORPAY_UPI"
    RAZORPAY_CARD = "RAZORPAY_CARD"
    RAZORPAY_NETBANKING = "RAZORPAY_NETBANKING"
    DIRECT_QR = "DIRECT_QR"
    COD = "COD"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class FulfillmentType(str, Enum):
    DELIVERY = "DELIVERY"
    PICKUP = "PICKUP"
    DINE_IN = "DINE_IN"

class OrderItemInput(BaseModel):
    item_id: str
    quantity: int = Field(..., ge=1)

class OrderItemDetail(BaseModel):
    item_id: str
    name: str
    price: float
    quantity: int
    total: float
    image_url: Optional[str] = None
    category: Optional[str] = None

class StatusHistoryEntry(BaseModel):
    status: OrderStatus
    timestamp: str
    note: Optional[str] = None

class OrderCreateRequest(BaseModel):
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    fulfillment_type: FulfillmentType = FulfillmentType.DELIVERY
    table_number: Optional[str] = None
    table_name: Optional[str] = None
    delivery_address: Optional[dict] = None
    order_instructions: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.COD
    items: List[OrderItemInput]

class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
    prep_time_minutes: Optional[int] = None
    rejection_reason: Optional[str] = None
    note: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class UpiPaymentConfirmRequest(BaseModel):
    order_id: str
    utr_number: Optional[str] = None
    upi_app: Optional[str] = None

class RazorpayCreateOrderRequest(BaseModel):
    order_id: str

class OrderResponse(BaseModel):
    id: str
    order_id: str
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    fulfillment_type: FulfillmentType
    table_number: Optional[str] = None
    table_name: Optional[str] = None
    delivery_address: Optional[dict] = None
    order_instructions: Optional[str] = None
    items: List[OrderItemDetail]
    subtotal: float
    discount_amount: float = 0.0
    coupon_code: Optional[str] = None
    tax_amount: float
    delivery_fee: float = 0.0
    packaging_fee: float = 0.0
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    order_status: OrderStatus
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    estimated_prep_time_minutes: int = 25
    rejection_reason: Optional[str] = None
    status_history: List[StatusHistoryEntry] = []
    created_at: str
    updated_at: str
