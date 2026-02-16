const http = require("http")
const fs = require("fs")

let students = [
  { id: 1, name: "Amit" },
  { id: 2, name: "Neha" }
]

const server = http.createServer((req, res) => {
  fs.appendFile("log.txt", new Date() + " " + req.method + " " + req.url + "\n", () => {})

  if (req.method === "GET" && req.url === "/students") {
    res.end(JSON.stringify(students))
  }

  else if (req.method === "GET" && req.url.startsWith("/students/")) {
    const id = parseInt(req.url.split("/")[2])
    const student = students.find(s => s.id === id)
    res.end(JSON.stringify(student || "Student not found"))
  }

  else if (req.method === "POST" && req.url === "/students") {
    let body = ""
    req.on("data", c => body += c)
    req.on("end", () => {
      const s = JSON.parse(body)
      s.id = students.length + 1
      students.push(s)
      res.end(JSON.stringify(s))
    })
  }

  else if (req.method === "DELETE" && req.url.startsWith("/students/")) {
    const id = parseInt(req.url.split("/")[2])
    students = students.filter(s => s.id !== id)
    res.end(JSON.stringify("Student deleted"))
  }

  else {
    res.end("404 Not Found")
  }
})

server.listen(3000)