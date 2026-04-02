from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import AdminUser, Attendee
from app.schemas import WhatsAppSendRequest, WhatsAppBulkRequest, QRCodeResponse
from app.auth import get_current_admin
from app.utils.whatsapp import send_whatsapp_invite, send_bulk_invites
from app.utils.qr import generate_qr_code

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.post("/send")
async def send_invite(
    body: WhatsAppSendRequest,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Send a single WhatsApp RSVP invite."""
    try:
        result = await send_whatsapp_invite(
            phone_number=body.phone,
            name=body.name,
            custom_message=body.custom_message,
        )
        # Mark as sent in DB if attendee exists
        res = await db.execute(select(Attendee).where(Attendee.phone == body.phone))
        attendee = res.scalar_one_or_none()
        if attendee:
            attendee.invite_sent = True
            await db.commit()

        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WhatsApp error: {str(e)}")


@router.post("/send-bulk")
async def send_bulk(
    body: WhatsAppBulkRequest,
    _: AdminUser = Depends(get_current_admin),
):
    """Send WhatsApp RSVP invites to multiple numbers."""
    if len(body.phones) > 100:
        raise HTTPException(status_code=400, detail="Max 100 numbers per bulk send")

    results = await send_bulk_invites(body.phones, custom_message=body.custom_message)
    success_count = sum(1 for r in results if r["success"])

    return {
        "total": len(results),
        "success": success_count,
        "failed": len(results) - success_count,
        "results": results,
    }


@router.get("/qr-code", response_model=QRCodeResponse)
async def get_qr_code(_: AdminUser = Depends(get_current_admin)):
    """Generate a QR code for the RSVP page."""
    data_url, rsvp_url = generate_qr_code()
    return QRCodeResponse(qr_data_url=data_url, rsvp_url=rsvp_url)
