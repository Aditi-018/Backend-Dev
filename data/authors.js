let authors = [
  { id: 1, name: "F. Scott Fitzgerald", nationality: "American", born: 1896, died: 1940 },
  { id: 2, name: "Harper Lee",          nationality: "American", born: 1926, died: 2016 },
  { id: 3, name: "George Orwell",       nationality: "British",  born: 1903, died: 1950 },
  { id: 4, name: "Aldous Huxley",       nationality: "British",  born: 1894, died: 1963 },
  { id: 5, name: "J.D. Salinger",       nationality: "American", born: 1919, died: 2010 },
  { id: 6, name: "Jane Austen",         nationality: "British",  born: 1775, died: 1817 },
  { id: 7, name: "J.R.R. Tolkien",      nationality: "British",  born: 1892, died: 1973 },
  { id: 8, name: "Ray Bradbury",        nationality: "American", born: 1920, died: 2012 },
];

let nextId = 9;

function getAll()          { return authors; }
function getById(id)       { return authors.find(a => a.id === id); }
function create(data)      { const author = { id: nextId++, ...data }; authors.push(author); return author; }
function update(id, data)  { const i = authors.findIndex(a => a.id === id); if (i === -1) return null; authors[i] = { ...authors[i], ...data, id }; return authors[i]; }
function remove(id)        { const i = authors.findIndex(a => a.id === id); if (i === -1) return false; authors.splice(i, 1); return true; }

module.exports = { getAll, getById, create, update, remove };
