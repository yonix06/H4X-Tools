from datetime import datetime
from .database import db
from sqlalchemy.dialects.postgresql import JSONB

class ToolResult(db.Model):
    __tablename__ = 'tool_results'
    
    id = db.Column(db.Integer, primary_key=True)
    tool_id = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    input_data = db.Column(JSONB, nullable=False)
    result_data = db.Column(JSONB, nullable=True)
    status = db.Column(db.String(20), nullable=False)  # success, error, pending
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'tool_id': self.tool_id,
            'timestamp': self.timestamp.isoformat(),
            'input_data': self.input_data,
            'result_data': self.result_data,
            'status': self.status
        }

class Investigation(db.Model):
    __tablename__ = 'investigations'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='active')  # active, archived, closed
    severity = db.Column(db.String(20), nullable=False, default='medium')  # low, medium, high, critical
    results = db.relationship('ToolResult', backref='investigation', lazy=True)
    notes = db.relationship('InvestigationNote', backref='investigation', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'status': self.status,
            'severity': self.severity,
            'results': [result.to_dict() for result in self.results],
            'notes': [note.to_dict() for note in self.notes]
        }

class InvestigationNote(db.Model):
    __tablename__ = 'investigation_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    investigation_id = db.Column(db.Integer, db.ForeignKey('investigations.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'investigation_id': self.investigation_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SecurityEvent(db.Model):
    __tablename__ = 'security_events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)  # fail2ban, vpn, custom
    source_ip = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(JSONB, nullable=False)
    severity = db.Column(db.String(20), nullable=False, default='medium')
    status = db.Column(db.String(20), nullable=False, default='new')  # new, investigating, resolved
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