from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TableStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    BILLING = "BILLING"
    RESERVED = "RESERVED"


class ServiceRequestType(str, Enum):
    CALL_WAITER = "CALL_WAITER"
    REQUEST_BILL = "REQUEST_BILL"
    WATER = "WATER"
    CUTLERY = "CUTLERY"


class TableCreate(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=20)
    table_name: str = Field(..., min_length=1, max_length=80)
    capacity: int = Field(default=4, ge=1, le=30)
    section: str = Field(default="Main Hall", max_length=60)
    status: TableStatus = TableStatus.AVAILABLE
    is_active: bool = True


class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    table_name: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1, le=30)
    section: Optional[str] = None
    status: Optional[TableStatus] = None
    is_active: Optional[bool] = None


class ServiceRequestCreate(BaseModel):
    request_type: ServiceRequestType = ServiceRequestType.CALL_WAITER
    customer_name: Optional[str] = None
    note: Optional[str] = None
