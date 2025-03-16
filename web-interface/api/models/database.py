"""Database initialization and configuration"""
import os
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy with no settings
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the given Flask app"""
    # Get database URL from environment variable with fallback
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/h4xtools')
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Initialize extensions
    db.init_app(app)

    return db