// ─── Exercise 2: Input Validation Middleware ──────────────────────────────────
// Validates book input: year must be a number between 1000 and the current year.

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR     = 1000;

/**
 * validateBook — runs on POST /books and PUT /books/:id.
 * Checks required fields and validates the year field.
 */
function validateBook(req, res, next) {
  const { title, author, year } = req.body;
  const errors = [];

  // Required fields (only enforce on POST; PUT can be partial)
  if (req.method === "POST") {
    if (!title  || typeof title  !== "string" || title.trim()  === "")
      errors.push("'title' is required and must be a non-empty string.");
    if (!author || typeof author !== "string" || author.trim() === "")
      errors.push("'author' is required and must be a non-empty string.");
    if (year === undefined || year === null)
      errors.push("'year' is required.");
  }

  // Year validation (when provided)
  if (year !== undefined && year !== null) {
    const parsed = Number(year);

    if (!Number.isInteger(parsed))
      errors.push(`'year' must be an integer, got: ${year}`);
    else if (parsed < MIN_YEAR || parsed > CURRENT_YEAR)
      errors.push(`'year' must be between ${MIN_YEAR} and ${CURRENT_YEAR}, got: ${parsed}`);
  }

  if (errors.length > 0)
    return res.status(400).json({ success: false, errors });

  next();
}

/**
 * validateAuthor — runs on POST /authors and PUT /authors/:id.
 */
function validateAuthor(req, res, next) {
  const { name, born, died } = req.body;
  const errors = [];

  if (req.method === "POST") {
    if (!name || typeof name !== "string" || name.trim() === "")
      errors.push("'name' is required and must be a non-empty string.");
    if (born === undefined || born === null)
      errors.push("'born' is required.");
  }

  if (born !== undefined && born !== null) {
    const parsed = Number(born);
    if (!Number.isInteger(parsed))
      errors.push(`'born' must be an integer, got: ${born}`);
    else if (parsed < 0 || parsed > CURRENT_YEAR)
      errors.push(`'born' must be between 0 and ${CURRENT_YEAR}, got: ${parsed}`);
  }

  if (died !== undefined && died !== null) {
    const parsed = Number(died);
    if (!Number.isInteger(parsed))
      errors.push(`'died' must be an integer, got: ${died}`);
    else if (parsed < 0 || parsed > CURRENT_YEAR)
      errors.push(`'died' must be between 0 and ${CURRENT_YEAR}, got: ${parsed}`);
  }

  if (errors.length > 0)
    return res.status(400).json({ success: false, errors });

  next();
}

module.exports = { validateBook, validateAuthor };
