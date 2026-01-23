// const http = require("http");
// const server = http.createServer((req, res) =>{
//     res.writeHead(200,{
//         "content-type" :"plain/text"
//     });
//     res.end("Hello World");
// })

//how to do in html
//const http = require("http");

//plain text

// const server = http.createServer((req,res)=>{
//     res.writeHead(200,{
//         "content-type":"plain/text"
//     });
//     res.end("hello");
// });

const http = require("http");
// const server = http.createServer((req, res)=>{

//     res.writeHead(200,{
//         "content-type":"plain/text",
//     })
//     res.end("Hello Yateesh, from Server..");
// })

const server = http.createServer((req, res) => {

  if (req.url == "/home") {
    res.writeHead(200, {
      "content-type": "text/html",
    });
    res.end("<h1> Home Page</h1>");

  } else if (req.url == "/about") {
    res.writeHead(200, {
      "content-type": "text/html",
    });
    res.end("<h1> About Page</h1>");

  } else {
    res.writeHead(404, {
      "content-type": "text/html",
    });
    res.end("<h1> Page Not Found</h1>");
  }

});

server.listen(8000, () => {
  console.log("Server has been started on port 8000");
});