from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class AddressModel(BaseModel):
    id: Optional[str] = None
    title: str = "Home"  # Home, Work, Other
    address_line: str
    landmark: Optional[str] = None
    city: str = "Bengaluru"
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    addresses: Optional[List[AddressModel]] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str = "customer"
    addresses: List[AddressModel] = []
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ChangeCredentialsRequest(BaseModel):
    current_password: str
    new_email: Optional[EmailStr] = None
    new_name: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6)

class CreateAdminUserRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)
    role: str = "admin"  # "admin" or "staff"
