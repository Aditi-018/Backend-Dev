const express = require("express");
const app     = express();
const PORT    = process.env.PORT || 3000;

// ── Parse JSON bodies ────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/books",   require("./routes/books"));
app.use("/authors", require("./routes/authors"));

// ── Root — quick API reference ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Books & Authors API",
    endpoints: {
      books: {
        "GET    /books":              "List all books (supports ?author=, ?year=, ?search=, ?page=, ?limit=)",
        "GET    /books/search":       "Search books by title (?title=)",
        "GET    /books/:id":          "Get a single book",
        "POST   /books":              "Create a book  { title, author, year, genre }",
        "PUT    /books/:id":          "Update a book  { title?, author?, year?, genre? }",
        "DELETE /books/:id":          "Delete a book",
      },
      authors: {
        "GET    /authors":            "List all authors (supports ?name=, ?nationality=)",
        "GET    /authors/:id":        "Get a single author",
        "POST   /authors":            "Create an author  { name, nationality?, born, died? }",
        "PUT    /authors/:id":        "Update an author  { name?, nationality?, born?, died? }",
        "DELETE /authors/:id":        "Delete an author",
      },
    },
    exercises: {
      1: "Filter GET /books by ?author= and/or ?year=",
      2: "Validation middleware — year must be integer between 1000 and current year",
      3: "Pagination on GET /books via ?page= and ?limit=",
      4: "Full CRUD on /authors resource",
      5: "Search books by title via GET /books?search= or GET /books/search?title=",
    },
  });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/ for the full endpoint reference.`);
});
