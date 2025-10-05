from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def register_error_handlers(app):

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"msg": "Resource not found"}), 404

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"msg": "Bad request"}), 400

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"msg": "Internal server error"}), 500

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
    register_error_handlers(app)

    from app.models import TokenBlocklist
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
        return token is not None

    from app import models  # Ensure models are imported for migrations

    from app.auth import auth_bp
    from app.routes import main_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(main_bp, url_prefix="/api")

    return app

