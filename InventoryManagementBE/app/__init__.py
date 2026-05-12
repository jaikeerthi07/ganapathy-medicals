from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

import json
from decimal import Decimal

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    print("Creating Flask App...")
    app.config.from_object(Config)
    app.json.cls = CustomJSONEncoder

    # Initialize database
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize JWT
    jwt.init_app(app)

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Import models so Flask-Migrate detects them
    from app import models

    # Register Blueprints
    from app.routes.login_routes import login_bp
    from app.routes.product_routes import product_bp
    from app.routes.billing_routes import billing_bp
    from app.routes.supplier_routes import supplier_bp
    from app.routes.quotation_routes import quotation_bp
    from app.routes.usertype_routes import user_type_bp
    from app.routes.employee_routes import employee_bp
    from app.routes.current_company_routes import company_bp
    from app.routes.enquiry_routes import enquiry_bp
    from app.routes.discount_routes import discount_bp
    from app.routes.permissions_routes import permissions_bp
    from app.routes.payment_routes import payment_tracking_bp
    from app.routes.Check_permissions_routes import check_permissions_bp
    from app.routes.restore_permissions_routes import restore_permissions_bp
    from app.routes.patient_routes import patient_bp

    app.register_blueprint(login_bp, url_prefix="/api")
    app.register_blueprint(product_bp, url_prefix="/api")
    app.register_blueprint(billing_bp, url_prefix="/api")
    app.register_blueprint(supplier_bp)
    app.register_blueprint(quotation_bp, url_prefix='/api')
    app.register_blueprint(user_type_bp)
    app.register_blueprint(employee_bp, url_prefix="/api")
    app.register_blueprint(company_bp)
    app.register_blueprint(enquiry_bp, url_prefix="/api") 
    app.register_blueprint(discount_bp)
    app.register_blueprint(permissions_bp)
    app.register_blueprint(payment_tracking_bp)
    app.register_blueprint(check_permissions_bp)
    app.register_blueprint(restore_permissions_bp)
    app.register_blueprint(patient_bp, url_prefix="/api/patients")

    # Health Check Route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            "status": "healthy",
            "message": "API is working"
        }, 200

    return app