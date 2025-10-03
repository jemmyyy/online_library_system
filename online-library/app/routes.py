from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app import db
from app.models import Book, Reservation, Notification
from app.utils import role_required
from datetime import datetime, timedelta

main_bp = Blueprint("main", __name__)

@main_bp.route("/books", methods=["GET"])
def list_books():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    title = request.args.get("title", "", type=str)
    author = request.args.get("author", "", type=str)

    query = Book.query
    if title:
        query = query.filter(Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(Book.author.ilike(f"%{author}%"))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    books = [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "isbn": b.isbn,
            "available_copies": b.available_copies,
            "total_copies": b.total_copies,
            "description": b.description,
        }
        for b in pagination.items
    ]

    return jsonify({
        "books": books,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages
    }), 200


@main_bp.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "available_copies": book.available_copies,
        "total_copies": book.total_copies,
        "description": book.description
    }), 200


@main_bp.route("/books", methods=["POST"])
@role_required("librarian")
def add_book():
    data = request.get_json()
    book = Book(
        title=data.get("title"),
        author=data.get("author"),
        isbn=data.get("isbn"),
        available_copies=data.get("available_copies", 1),
        total_copies=data.get("total_copies", 1),
        description=data.get("description")
    )
    db.session.add(book)
    db.session.commit()
    return jsonify({"msg": "Book added successfully", "id": book.id}), 201


@main_bp.route("/books/<int:book_id>", methods=["PUT"])
@role_required("librarian")
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    book.title = data.get("title", book.title)
    book.author = data.get("author", book.author)
    book.isbn = data.get("isbn", book.isbn)
    book.available_copies = data.get("available_copies", book.available_copies)
    book.total_copies = data.get("total_copies", book.total_copies)
    book.description = data.get("description", book.description)

    db.session.commit()
    return jsonify({"msg": "Book updated successfully"}), 200


@main_bp.route("/books/<int:book_id>", methods=["DELETE"])
@role_required("librarian")
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Book deleted successfully"}), 200

@main_bp.route("/reservations", methods=["POST"])
@jwt_required()
def create_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()

    book_id = data.get("book_id")
    if not book_id:
        return jsonify({"msg": "book_id is required"}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Book not found"}), 404

    if book.available_copies <= 0:
        return jsonify({"msg": "No copies available"}), 400

    reservation = Reservation(
        user_id=user_id,
        book_id=book_id,
        status="pending",
        created_at=datetime.now(),
        due_date=datetime.now() + timedelta(days=14)  # 2 weeks loan
    )
    db.session.add(reservation)
    db.session.commit()

    return jsonify({"msg": "Reservation created", "id": reservation.id}), 201


@main_bp.route("/reservations/<int:res_id>", methods=["PUT"])
@role_required("librarian")
def update_reservation(res_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["approved", "rejected"]:
        return jsonify({"msg": "Invalid status."}), 400

    reservation = Reservation.query.get_or_404(res_id)
    book = Book.query.get(reservation.book_id)

    if reservation.status != "pending":
        return jsonify({"msg": "Reservation already processed"}), 400

    if status == "approved":
        if book.available_copies <= 0:
            return jsonify({"msg": "No copies available"}), 400
        book.available_copies -= 1
        reservation.status = "approved"
        reservation.due_date = datetime.now() + timedelta(days=14)
    else:
        reservation.status = "rejected"

    db.session.commit()
    return jsonify({"msg": f"Reservation {reservation.status}"}), 200

@main_bp.route("/reservations/<int:res_id>/return", methods=["POST"])
@jwt_required()
def request_return(res_id):
    user_id = get_jwt_identity()
    reservation = Reservation.query.get_or_404(res_id)

    if reservation.user_id != int(user_id):
        return jsonify({"msg": "You can only return your own reservations"}), 403

    if reservation.status != "approved":
        return jsonify({"msg": "Only approved reservations can be returned"}), 400

    # Mark returned, waiting librarian confirmation
    reservation.status = "returned"
    reservation.returned_at = datetime.now()
    db.session.commit()

    return jsonify({"msg": "Return requested"}), 200


@main_bp.route("/reservations/<int:res_id>/confirm_return", methods=["POST"])
@role_required("librarian")
def confirm_return(res_id):
    reservation = Reservation.query.get_or_404(res_id)
    book = Book.query.get(reservation.book_id)

    if reservation.status != "returned":
        return jsonify({"msg": "Reservation not marked for return"}), 400

    # Restore available copies
    book.available_copies += 1
    reservation.status = "completed"
    db.session.commit()

    return jsonify({"msg": "Return confirmed, book available again"}), 200