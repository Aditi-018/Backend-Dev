let books = [
  { id: 1, title: "The Great Gatsby",        author: "F. Scott Fitzgerald", year: 1925, genre: "Novel" },
  { id: 2, title: "To Kill a Mockingbird",   author: "Harper Lee",          year: 1960, genre: "Novel" },
  { id: 3, title: "1984",                    author: "George Orwell",       year: 1949, genre: "Dystopia" },
  { id: 4, title: "Animal Farm",             author: "George Orwell",       year: 1945, genre: "Satire" },
  { id: 5, title: "Brave New World",         author: "Aldous Huxley",       year: 1932, genre: "Dystopia" },
  { id: 6, title: "The Catcher in the Rye",  author: "J.D. Salinger",       year: 1951, genre: "Novel" },
  { id: 7, title: "Pride and Prejudice",     author: "Jane Austen",         year: 1813, genre: "Romance" },
  { id: 8, title: "The Hobbit",             author: "J.R.R. Tolkien",      year: 1937, genre: "Fantasy" },
  { id: 9, title: "Fahrenheit 451",         author: "Ray Bradbury",        year: 1953, genre: "Dystopia" },
  { id: 10, title: "Of Mice and Men",        author: "John Steinbeck",      year: 1937, genre: "Novel" },
  { id: 11, title: "The Old Man and the Sea",author: "Ernest Hemingway",    year: 1952, genre: "Novel" },
  { id: 12, title: "Lord of the Flies",      author: "William Golding",     year: 1954, genre: "Novel" },
];

let nextId = 13;

function getAll()          { return books; }
function getById(id)       { return books.find(b => b.id === id); }
function create(data)      { const book = { id: nextId++, ...data }; books.push(book); return book; }
function update(id, data)  { const i = books.findIndex(b => b.id === id); if (i === -1) return null; books[i] = { ...books[i], ...data, id }; return books[i]; }
function remove(id)        { const i = books.findIndex(b => b.id === id); if (i === -1) return false; books.splice(i, 1); return true; }

module.exports = { getAll, getById, create, update, remove };
