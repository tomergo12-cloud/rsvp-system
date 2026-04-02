from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, Text, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    YES = "yes"
    NO = "no"
    MAYBE = "maybe"
    PENDING = "pending"


class Attendee(Base):
    __tablename__ = "attendees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(30), nullable=False, unique=True, index=True)
    guests_count = Column(Integer, default=0, nullable=False)
    status = Column(SAEnum(AttendanceStatus), default=AttendanceStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    dietary = Column(String(200), nullable=True)
    invite_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Attendee {self.name} ({self.phone}) - {self.status}>"


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AdminUser {self.email}>"
