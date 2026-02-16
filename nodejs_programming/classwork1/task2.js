const http = require("http")
const url = require("url")

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname

  if (req.method === "GET") {
    if (path === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" })
      res.end("Welcome to the Home Page")
    } 
    else if (path === "/about") {
      res.writeHead(200, { "Content-Type": "text/html" })
      res.end("<h1>About Page</h1><p>This is a simple HTML response</p>")
    } 
    else if (path === "/user") {
      const name = parsedUrl.query.name
      const age = parsedUrl.query.age

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ name: name, age: age }))
    } 
    else {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("404 Page Not Found")
    }
  }
})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})