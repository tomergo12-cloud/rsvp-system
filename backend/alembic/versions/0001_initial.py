"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── admin_users ─────────────────────────────────────────────────────────
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(200), nullable=False),
        sa.Column('hashed_password', sa.String(200), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_admin_users_email', 'admin_users', ['email'], unique=True)
    op.create_index('ix_admin_users_id', 'admin_users', ['id'])

    # ── attendees ───────────────────────────────────────────────────────────
    op.create_table(
        'attendees',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('phone', sa.String(30), nullable=False),
        sa.Column('guests_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column(
            'status',
            sa.Enum('yes', 'no', 'maybe', 'pending', name='attendancestatus'),
            nullable=False,
            server_default='pending',
        ),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('dietary', sa.String(200), nullable=True),
        sa.Column('invite_sent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_attendees_id', 'attendees', ['id'])
    op.create_index('ix_attendees_phone', 'attendees', ['phone'], unique=True)


def downgrade() -> None:
    op.drop_table('attendees')
    op.execute("DROP TYPE IF EXISTS attendancestatus")
    op.drop_table('admin_users')
