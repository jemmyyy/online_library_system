from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import Notification

def role_required(role):
    """
    Decorator to enforce role-based access control.
    Example: @role_required("librarian")
    """
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            print("JWT Claims:", claims.get("role"))
            if claims.get("role") != role:
                return jsonify({"msg": "Forbidden, {} only".format(role)}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def create_notification(user_id, message):
    """Helper to create a notification for a user"""
    notif = Notification(user_id=user_id, message=message)
    db.session.add(notif)
    db.session.commit()

    print(f"Notification created for user {user_id}: {message}")