from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import AttendanceStatus
import re


# ─── Auth ────────────────────────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Attendee ────────────────────────────────────────────────────────────────

class AttendeeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=7, max_length=20)
    guests_count: int = Field(ge=0, le=20, default=0)
    status: AttendanceStatus = AttendanceStatus.PENDING
    notes: Optional[str] = Field(default=None, max_length=500)
    dietary: Optional[str] = Field(default=None, max_length=200)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Strip spaces/dashes/parens, keep + prefix
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[0-9]{7,15}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[\w\s\-'\.À-ÿ\u0590-\u05FF]+$", v):
            raise ValueError("Name contains invalid characters")
        return v


class AttendeeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    phone: Optional[str] = Field(default=None, min_length=7, max_length=20)
    guests_count: Optional[int] = Field(default=None, ge=0, le=20)
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    dietary: Optional[str] = Field(default=None, max_length=200)
    invite_sent: Optional[bool] = None


class AttendeeResponse(BaseModel):
    id: int
    name: str
    phone: str
    guests_count: int
    status: AttendanceStatus
    notes: Optional[str]
    dietary: Optional[str]
    invite_sent: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendeeListResponse(BaseModel):
    total: int
    confirmed: int
    not_coming: int
    maybe: int
    pending: int
    total_guests: int
    attendees: List[AttendeeResponse]


# ─── WhatsApp ─────────────────────────────────────────────────────────────────

class WhatsAppSendRequest(BaseModel):
    phone: str
    name: Optional[str] = None
    custom_message: Optional[str] = None


class WhatsAppBulkRequest(BaseModel):
    phones: List[str]
    custom_message: Optional[str] = None


class QRCodeResponse(BaseModel):
    qr_data_url: str
    rsvp_url: str
