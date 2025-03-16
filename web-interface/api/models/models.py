"""Database models for the API"""
from datetime import datetime
from .database import db, Base

class Investigation(Base):
    """Investigation model for tracking security investigations"""
    __tablename__ = 'investigations'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='active')
    severity = db.Column(db.String(20), nullable=False, default='medium')

    notes = db.relationship('InvestigationNote', backref='investigation', lazy=True, cascade='all, delete-orphan')
    tool_results = db.relationship('ToolResult', backref='investigation', lazy=True, cascade='all, delete-orphan')
    security_events = db.relationship('SecurityEvent', backref='investigation', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'status': self.status,
            'severity': self.severity,
            'notes_count': len(self.notes),
            'events_count': len(self.security_events),
            'tool_results_count': len(self.tool_results)
        }

class InvestigationNote(Base):
    """Notes associated with an investigation"""
    __tablename__ = 'investigation_notes'

    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ToolResult(Base):
    """Results from running security tools"""
    __tablename__ = 'tool_results'

    id = db.Column(db.Integer, primary_key=True)
    tool_id = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    input_data = db.Column(db.JSON, nullable=False)
    result_data = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending')
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'tool_id': self.tool_id,
            'timestamp': self.timestamp.isoformat(),
            'input_data': self.input_data,
            'result_data': self.result_data,
            'status': self.status,
            'investigation_id': self.investigation_id
        }

class SecurityEvent(Base):
    """Security events from system monitoring"""
    __tablename__ = 'security_events'

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)
    source_ip = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    details = db.Column(db.JSON, nullable=False)
    severity = db.Column(db.String(20), nullable=False, default='medium')
    status = db.Column(db.String(20), nullable=False, default='new')
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'source_ip': self.source_ip,
            'timestamp': self.timestamp.isoformat(),
            'details': self.details,
            'severity': self.severity,
            'status': self.status,
            'investigation_id': self.investigation_id
        }