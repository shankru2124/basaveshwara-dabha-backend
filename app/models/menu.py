from typing import Optional, List
from pydantic import BaseModel, Field

class CategoryModel(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    display_order: int = 0
    is_active: bool = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    display_order: int = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class MenuItemModel(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: str
    price: float = Field(..., gt=0)
    image_url: str
    is_veg: bool = True  # Strict pure vegetarian restaurant
    is_available: bool = True
    is_popular: bool = False
    is_today_special: bool = False
    preparation_time_minutes: int = 20
    spicy_level: int = 1  # 1: Mild, 2: Medium, 3: Spicy
    calories: Optional[int] = None
    portion_size: Optional[str] = None

class MenuItemCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float = Field(..., gt=0)
    image_url: str
    is_available: bool = True
    is_popular: bool = False
    is_today_special: bool = False
    preparation_time_minutes: int = 20
    spicy_level: int = 1
    calories: Optional[int] = None
    portion_size: Optional[str] = None

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_popular: Optional[bool] = None
    is_today_special: Optional[bool] = None
    preparation_time_minutes: Optional[int] = None
    spicy_level: Optional[int] = None
    calories: Optional[int] = None
    portion_size: Optional[str] = None

class AvailabilityToggle(BaseModel):
    is_available: bool
