"""Main Flask application module"""
from flask import Flask
from flask_cors import CORS
from models.database import init_db, db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)

    # Initialize database
    init_db(app)

    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'database': 'connected' if db.engine else 'disconnected'}

    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)