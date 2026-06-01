from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def require_text(value: str) -> str:
    cleaned = clean_text(value)
    if cleaned is None:
        raise ValueError("Field cannot be empty")
    return cleaned


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    quantity: int = Field(..., ge=0)
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name", "sku", mode="before")
    @classmethod
    def required_strings(cls, value):
        return require_text(value)

    @field_validator("description", mode="before")
    @classmethod
    def optional_description(cls, value):
        return clean_text(value)

    @field_validator("currency", mode="before")
    @classmethod
    def validate_currency(cls, value):
        if value is None:
            return "USD"
        val = str(value).strip().upper()
        if val not in ["USD", "EUR", "INR"]:
            raise ValueError("Currency must be one of: USD, EUR, INR")
        return val



class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    price: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=10)
    quantity: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name", "sku", mode="before")
    @classmethod
    def optional_required_strings(cls, value):
        if value is None:
            return None
        return require_text(value)

    @field_validator("description", mode="before")
    @classmethod
    def optional_description(cls, value):
        return clean_text(value)

    @field_validator("currency", mode="before")
    @classmethod
    def validate_currency(cls, value):
        if value is None:
            return None
        val = str(value).strip().upper()
        if val not in ["USD", "EUR", "INR"]:
            raise ValueError("Currency must be one of: USD, EUR, INR")
        return val



class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=1, max_length=20)

    @field_validator("full_name", "phone", mode="before")
    @classmethod
    def required_strings(cls, value):
        return require_text(value)

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return str(value).lower()


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class ProductSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    currency: str = "USD"



class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductSummary] = None


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse] = []
    customer: Optional[CustomerResponse] = None
