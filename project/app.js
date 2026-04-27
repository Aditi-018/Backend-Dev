const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const users = [
  { id: 1, name: "Sona" },
  { id: 2, name: "Lakshita" },
  { id: 3, name: "Abhishek" },
  { id: 4, name: "Birju" },
  { id: 5, name: "Binod" },
];

app.get("/users", (req, res) => {
  const nameQuery = req.query.name;

  if (nameQuery) {
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(nameQuery.toLowerCase())
    );
    return res.json(filteredUsers);
  }

  res.json(users);
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const end = Date.now();
    console.log(`${req.method} ${req.url} - ${end - start}ms`);
  });

  next();
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", (req, res) => {
  const { name, message } = req.body;
  res.send(`Thank you ${name}, your message is received!`);
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.get("/gallery", (req, res) => {
  const images = ["img1.jpg", "img2.jpg"];
  res.render("gallery", { images });
});
let posts = [
  { id: 1, title: "First Post", content: "Hello World!" }
];
app.get("/blog", (req, res) => {
  res.render("blog", { posts });
});
app.get("/blog/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  res.render("post", { post });
});
app.get("/blog/new", (req, res) => {
  res.render("newpost");
});

app.post("/blog", (req, res) => {
  const { title, content } = req.body;

  posts.push({
    id: posts.length + 1,
    title,
    content
  });

  res.redirect("/blog");
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});