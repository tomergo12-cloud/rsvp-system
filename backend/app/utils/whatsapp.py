"""
WhatsApp Cloud API (Meta) integration.
Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
"""
import httpx
from typing import Optional
from app.config import settings


async def send_whatsapp_invite(
    phone_number: str,
    name: Optional[str] = None,
    custom_message: Optional[str] = None,
) -> dict:
    """
    Send an RSVP invitation via WhatsApp Cloud API.

    Args:
        phone_number: E.164 format (e.g. +12125551234)
        name: Guest's name for personalisation
        custom_message: Override default message body

    Returns:
        API response dict
    """
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return {"error": "WhatsApp credentials not configured", "simulated": True}

    # Clean phone number – remove + for WhatsApp API
    clean_phone = phone_number.lstrip("+").replace(" ", "").replace("-", "")

    rsvp_url = f"{settings.APP_URL}/rsvp"
    greeting = f"Hi {name}," if name else "Hi there,"

    # Use a pre-approved template OR a free-form message if within 24h window.
    # This example uses a free-form message (works after user messages you first).
    # For cold outreach, use an approved template.
    message_body = custom_message or (
        f"{greeting} 🎉\n\n"
        f"You're invited to *{settings.EVENT_NAME}*!\n"
        f"📅 {settings.EVENT_DATE}\n"
        f"📍 {settings.EVENT_LOCATION}\n\n"
        f"Please confirm your attendance here:\n"
        f"🔗 {rsvp_url}\n\n"
        f"We'd love to see you there! 🥂"
    )

    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": "hello_world",
            "language": {"code": "en_US"}
        }
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()


async def send_whatsapp_template(
    phone_number: str,
    name: Optional[str] = None,
) -> dict:
    """
    Send using a pre-approved Meta template (for cold outreach).
    Template must be created and approved in Meta Business Manager first.
    """
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return {"error": "WhatsApp credentials not configured", "simulated": True}

    clean_phone = phone_number.lstrip("+").replace(" ", "").replace("-", "")
    rsvp_url = f"{settings.APP_URL}/rsvp"

    url = f"{settings.WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    # Template with named parameters – adjust component structure to match your template
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": settings.WHATSAPP_TEMPLATE_NAME,
            "language": {"code": "en_US"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": name or "Guest"},
                        {"type": "text", "text": settings.EVENT_NAME},
                        {"type": "text", "text": settings.EVENT_DATE},
                        {"type": "text", "text": rsvp_url},
                    ],
                }
            ],
        },
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()


async def send_bulk_invites(phones: list[str], custom_message: Optional[str] = None) -> list[dict]:
    """Send invites to a list of phone numbers. Returns list of results."""
    results = []
    for phone in phones:
        try:
            result = await send_whatsapp_invite(phone, custom_message=custom_message)
            results.append({"phone": phone, "success": True, "response": result})
        except Exception as e:
            results.append({"phone": phone, "success": False, "error": str(e)})
    return results
