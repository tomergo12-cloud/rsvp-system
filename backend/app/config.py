from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/rsvp_db"

    # JWT
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Admin
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "changeme123"

    # WhatsApp
    WHATSAPP_API_URL: str = "https://graph.facebook.com/v19.0"
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_TEMPLATE_NAME: str = "rsvp_invite"

    # App
    APP_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = '["http://localhost:3000"]'

    # Event
    EVENT_NAME: str = "Our Special Event"
    EVENT_DATE: str = "2024-12-31"
    EVENT_LOCATION: str = "Grand Ballroom"

    class Config:
        env_file = ".env"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    def get_cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return [self.CORS_ORIGINS]


settings = Settings()