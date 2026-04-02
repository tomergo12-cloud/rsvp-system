from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
import csv
import io
from datetime import datetime

from app.database import get_db
from app.models import Attendee, AttendanceStatus, AdminUser
from app.schemas import (
    AttendeeCreate, AttendeeUpdate, AttendeeResponse, AttendeeListResponse
)
from app.auth import get_current_admin

router = APIRouter(prefix="/rsvp", tags=["rsvp"])


# ─── Public endpoint: submit RSVP ────────────────────────────────────────────

@router.post("", response_model=AttendeeResponse, status_code=201)
async def create_rsvp(body: AttendeeCreate, request: Request, db: AsyncSession = Depends(get_db)):
    # Check duplicate phone
    result = await db.execute(select(Attendee).where(Attendee.phone == body.phone))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This phone number has already submitted an RSVP. Contact the host to update it."
        )

    attendee = Attendee(**body.model_dump())
    db.add(attendee)
    await db.commit()
    await db.refresh(attendee)
    return attendee


# ─── Admin: list all RSVPs ────────────────────────────────────────────────────

@router.get("/all", response_model=AttendeeListResponse)
async def list_rsvps(
    search: Optional[str] = Query(None, description="Search by name or phone"),
    status: Optional[AttendanceStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    query = select(Attendee)

    if search:
        like = f"%{search}%"
        query = query.where(or_(Attendee.name.ilike(like), Attendee.phone.ilike(like)))

    if status:
        query = query.where(Attendee.status == status)

    # Stats (unfiltered by pagination)
    stats_query = select(Attendee)
    if search:
        like = f"%{search}%"
        stats_query = stats_query.where(or_(Attendee.name.ilike(like), Attendee.phone.ilike(like)))
    if status:
        stats_query = stats_query.where(Attendee.status == status)

    stats_result = await db.execute(stats_query)
    all_attendees = stats_result.scalars().all()

    confirmed = sum(1 for a in all_attendees if a.status == AttendanceStatus.YES)
    not_coming = sum(1 for a in all_attendees if a.status == AttendanceStatus.NO)
    maybe = sum(1 for a in all_attendees if a.status == AttendanceStatus.MAYBE)
    pending = sum(1 for a in all_attendees if a.status == AttendanceStatus.PENDING)
    total_guests = sum(a.guests_count for a in all_attendees if a.status == AttendanceStatus.YES)

    # Paginated result
    paginated = await db.execute(
        query.order_by(Attendee.created_at.desc()).offset(skip).limit(limit)
    )
    attendees = paginated.scalars().all()

    return AttendeeListResponse(
        total=len(all_attendees),
        confirmed=confirmed,
        not_coming=not_coming,
        maybe=maybe,
        pending=pending,
        total_guests=total_guests,
        attendees=attendees,
    )


# ─── Admin: get single RSVP ───────────────────────────────────────────────────

@router.get("/{rsvp_id}", response_model=AttendeeResponse)
async def get_rsvp(
    rsvp_id: int,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Attendee).where(Attendee.id == rsvp_id))
    attendee = result.scalar_one_or_none()
    if not attendee:
        raise HTTPException(status_code=404, detail="RSVP not found")
    return attendee


# ─── Admin: update RSVP ───────────────────────────────────────────────────────

@router.put("/{rsvp_id}", response_model=AttendeeResponse)
async def update_rsvp(
    rsvp_id: int,
    body: AttendeeUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Attendee).where(Attendee.id == rsvp_id))
    attendee = result.scalar_one_or_none()
    if not attendee:
        raise HTTPException(status_code=404, detail="RSVP not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(attendee, field, value)

    await db.commit()
    await db.refresh(attendee)
    return attendee


# ─── Admin: delete RSVP ───────────────────────────────────────────────────────

@router.delete("/{rsvp_id}", status_code=204)
async def delete_rsvp(
    rsvp_id: int,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Attendee).where(Attendee.id == rsvp_id))
    attendee = result.scalar_one_or_none()
    if not attendee:
        raise HTTPException(status_code=404, detail="RSVP not found")
    await db.delete(attendee)
    await db.commit()


# ─── Admin: export CSV ────────────────────────────────────────────────────────

@router.get("/export/csv")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Attendee).order_by(Attendee.created_at.desc()))
    attendees = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Phone", "Guests", "Status", "Dietary", "Notes", "Invite Sent", "Created At"])

    for a in attendees:
        writer.writerow([
            a.id, a.name, a.phone, a.guests_count,
            a.status.value, a.dietary or "", a.notes or "",
            "Yes" if a.invite_sent else "No",
            a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else "",
        ])

    output.seek(0)
    filename = f"rsvp_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
