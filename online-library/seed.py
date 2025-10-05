# seed.py
import random
from app import create_app, db, bcrypt
from app.models import User, Book
from werkzeug.security import generate_password_hash

app = create_app()
app.app_context().push()

def seed_data():
    print("Seeding database...")

    # 1️⃣ Librarian account
    if not User.query.filter_by(email="lib@library.com").first():
        librarian = User(
            email="lib@library.com",
            name="Admin Librarian",
            password_hash=bcrypt.generate_password_hash("admin123").decode("utf-8"),
            role="librarian"
        )
        db.session.add(librarian)
        print("✅ Librarian account created: lib@library.com / admin123")

    # 2️⃣ Books
    genres = ["Fiction", "Science", "History", "Philosophy"]
    authors = ["Author A", "Author B", "Author C", "Author D", "Author E"]

    for genre in genres:
        for i in range(1, 6):  # 5 books per genre
            title = f"{genre} Book {i}"
            if not Book.query.filter_by(title=title).first():
                book = Book(
                    title=title,
                    author=random.choice(authors),
                    genre=genre,
                    isbn=f"{random.randint(1000000000, 9999999999)}",
                    total_copies=random.randint(2, 5),
                    available_copies=random.randint(1, 3),
                    description=f"A fascinating {genre.lower()} book about knowledge and discovery."
                )
                db.session.add(book)
    db.session.commit()
    print("Books added successfully!")
    print("Database seeding complete.")

if __name__ == "__main__":
    seed_data()
