// ─── Exercise 4: Authors Resource — Full CRUD ─────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../data/authors");
const { validateAuthor } = require("../middleware/validate");

// GET /authors  — list all (supports ?name=&nationality= filters)
router.get("/", (req, res) => {
  const { name, nationality } = req.query;
  let results = db.getAll();

  if (name) {
    const q = name.toLowerCase();
    results = results.filter(a => a.name.toLowerCase().includes(q));
  }
  if (nationality) {
    const q = nationality.toLowerCase();
    results = results.filter(a => a.nationality.toLowerCase().includes(q));
  }

  res.json({ success: true, total: results.length, data: results });
});

// GET /authors/:id  — get single author
router.get("/:id", (req, res) => {
  const author = db.getById(Number(req.params.id));
  if (!author) return res.status(404).json({ success: false, error: "Author not found." });
  res.json({ success: true, data: author });
});

// POST /authors  — create author
router.post("/", validateAuthor, (req, res) => {
  const { name, nationality, born, died } = req.body;
  const author = db.create({
    name:        name.trim(),
    nationality: nationality?.trim() || "Unknown",
    born:        Number(born),
    died:        died !== undefined ? Number(died) : null,
  });
  res.status(201).json({ success: true, data: author });
});

// PUT /authors/:id  — update author
router.put("/:id", validateAuthor, (req, res) => {
  const id = Number(req.params.id);
  const { name, nationality, born, died } = req.body;

  const updates = {};
  if (name        !== undefined) updates.name        = name.trim();
  if (nationality !== undefined) updates.nationality = nationality.trim();
  if (born        !== undefined) updates.born        = Number(born);
  if (died        !== undefined) updates.died        = died !== null ? Number(died) : null;

  const author = db.update(id, updates);
  if (!author) return res.status(404).json({ success: false, error: "Author not found." });
  res.json({ success: true, data: author });
});

// DELETE /authors/:id  — delete author
router.delete("/:id", (req, res) => {
  const removed = db.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ success: false, error: "Author not found." });
  res.json({ success: true, message: "Author deleted successfully." });
});

module.exports = router;
