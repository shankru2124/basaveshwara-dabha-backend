from typing import Optional
from pydantic import BaseModel, Field

class CouponModel(BaseModel):
    id: Optional[str] = None
    code: str
    discount_type: str = "percentage"  # percentage or fixed
    discount_value: float = Field(..., gt=0)
    max_discount_amount: Optional[float] = None
    min_order_amount: float = 0
    valid_until: Optional[str] = None
    is_active: bool = True
    usage_limit: Optional[int] = None
    used_count: int = 0

class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percentage"
    discount_value: float = Field(..., gt=0)
    max_discount_amount: Optional[float] = None
    min_order_amount: float = 0
    valid_until: Optional[str] = None
    is_active: bool = True

class CouponApplyRequest(BaseModel):
    code: str
    cart_total: float
