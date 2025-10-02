from flask import Blueprint, request, jsonify
from app import db
from app.models import Book
from app.utils import role_required

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
