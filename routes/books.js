const express = require("express");
const router  = express.Router();
const db      = require("../data/books");
const { validateBook } = require("../middleware/validate");

// ─────────────────────────────────────────────────────────────────────────────
// GET /books
//
// Exercise 1 — Filter by author and/or year:
//   GET /books?author=George Orwell
//   GET /books?year=1949
//   GET /books?author=George Orwell&year=1949
//
// Exercise 3 — Pagination:
//   GET /books?page=1&limit=5
//
// Exercise 5 — Search by title (partial, case-insensitive):
//   GET /books?search=great
//
// All query params can be combined:
//   GET /books?author=Orwell&page=1&limit=3
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const { author, year, search, page, limit } = req.query;

  let results = db.getAll();

  // ── Exercise 1: filter by author ─────────────────────────────────────────
  if (author) {
    const q = author.toLowerCase();
    results = results.filter(b => b.author.toLowerCase().includes(q));
  }

  // ── Exercise 1: filter by year ───────────────────────────────────────────
  if (year) {
    const y = Number(year);
    if (isNaN(y)) {
      return res.status(400).json({ success: false, error: "'year' query param must be a number." });
    }
    results = results.filter(b => b.year === y);
  }

  // ── Exercise 5: search by title ──────────────────────────────────────────
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(b => b.title.toLowerCase().includes(q));
  }

  const total = results.length;

  // ── Exercise 3: pagination ───────────────────────────────────────────────
  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.max(1, parseInt(limit) || total || 1); // default: return all

  const totalPages = Math.ceil(total / limitNum);
  const start      = (pageNum - 1) * limitNum;
  const paginated  = results.slice(start, start + limitNum);

  res.json({
    success: true,
    total,
    page:       pageNum,
    limit:      limitNum,
    totalPages,
    data:       paginated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /books/search  — Exercise 5 (dedicated search endpoint)
//   GET /books/search?title=gatsby
// ─────────────────────────────────────────────────────────────────────────────
router.get("/search", (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ success: false, error: "Query parameter 'title' is required." });
  }

  const q       = title.toLowerCase();
  const results = db.getAll().filter(b => b.title.toLowerCase().includes(q));

  res.json({ success: true, total: results.length, data: results });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /books/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const book = db.getById(Number(req.params.id));
  if (!book) return res.status(404).json({ success: false, error: "Book not found." });
  res.json({ success: true, data: book });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /books  (Exercise 2: validateBook middleware)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", validateBook, (req, res) => {
  const { title, author, year, genre } = req.body;
  const book = db.create({ title: title.trim(), author: author.trim(), year: Number(year), genre });
  res.status(201).json({ success: true, data: book });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /books/:id  (Exercise 2: validateBook middleware)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", validateBook, (req, res) => {
  const id   = Number(req.params.id);
  const { title, author, year, genre } = req.body;

  const updates = {};
  if (title  !== undefined) updates.title  = title.trim();
  if (author !== undefined) updates.author = author.trim();
  if (year   !== undefined) updates.year   = Number(year);
  if (genre  !== undefined) updates.genre  = genre;

  const book = db.update(id, updates);
  if (!book) return res.status(404).json({ success: false, error: "Book not found." });
  res.json({ success: true, data: book });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /books/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const removed = db.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ success: false, error: "Book not found." });
  res.json({ success: true, message: "Book deleted successfully." });
});

module.exports = router;
