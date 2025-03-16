"""Database initialization and configuration"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
Base = declarative_base()

def init_db(app):
    """Initialize the database with the given Flask app"""
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/h4xtools')
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Initialize SQLAlchemy
    db.init_app(app)
    
    # Setup Alembic engine
    engine = create_engine(database_url)
    db.session = scoped_session(sessionmaker(bind=engine))
    
    # Import models here to ensure they're registered with SQLAlchemy
    from .models import Investigation, InvestigationNote, ToolResult, SecurityEvent
    Base.metadata.bind = engine
    
    return db