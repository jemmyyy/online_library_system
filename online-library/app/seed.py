from app import db, create_app
from app.models import User

def seed_admin():
    app = create_app()
    with app.app_context():
        if not User.query.filter_by(email="admin@library.com").first():
            admin = User(name="Default Admin", email="admin@library.com", role="librarian")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            print("Default librarian created: admin@library.com / admin123")
        else:
            print("ℹLibrarian already exists")

if __name__ == "__main__":
    seed_admin()