"""Main Flask application module"""
from flask import Flask
from flask_cors import CORS
from models.database import db, init_db

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)

    # Initialize database
    init_db(app)

    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}

    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)