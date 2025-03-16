"""Add security monitoring tables

Revision ID: 001
Revises: 
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tool_results table
    op.create_table(
        'tool_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tool_id', sa.String(50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('input_data', JSONB, nullable=False),
        sa.Column('result_data', JSONB, nullable=True),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('investigation_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create investigations table
    op.create_table(
        'investigations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create investigation_notes table
    op.create_table(
        'investigation_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('investigation_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['investigation_id'], ['investigations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create security_events table
    op.create_table(
        'security_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('source_ip', sa.String(50), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('details', JSONB, nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('investigation_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['investigation_id'], ['investigations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_security_events_timestamp', 'security_events', ['timestamp'])
    op.create_index('ix_security_events_source_ip', 'security_events', ['source_ip'])
    op.create_index('ix_security_events_status', 'security_events', ['status'])
    op.create_index('ix_tool_results_timestamp', 'tool_results', ['timestamp'])
    op.create_index('ix_investigations_created_at', 'investigations', ['created_at'])
    op.create_index('ix_investigations_status', 'investigations', ['status'])


def downgrade():
    op.drop_table('security_events')
    op.drop_table('investigation_notes')
    op.drop_table('tool_results')
    op.drop_table('investigations')