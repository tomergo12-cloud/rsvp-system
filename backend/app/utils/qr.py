from typing import Optional
import qrcode
import base64
from io import BytesIO
from app.config import settings


def generate_qr_code(url: Optional[str] = None) -> tuple[str, str]:
    rsvp_url = url or f"{settings.APP_URL}/rsvp"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(rsvp_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1a1a2e", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    b64 = base64.b64encode(buffer.read()).decode("utf-8")

    return f"data:image/png;base64,{b64}", rsvp_url