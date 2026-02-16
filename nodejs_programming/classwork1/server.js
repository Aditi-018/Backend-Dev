const http = require("http");
const fs = require("fs");

const myServer = http.createServer((req, res) => {
let responseText= "";

    switch (req.url) {
        case "/":
            responseText = "homepage";
            break;
        case "/about":
            responseText = "about page";
            break;
        case "/contact": 
            responseText = "contact page";
            break;
        default:
            responseText = "error 404";
            break;
    }
   const log = `${Date.now()}: ${req.url} New Request Rec.\n`;
   fs.appendFile("log.txt", log, (error) => {
        if (error) {
            console.error("Error in logging");
        }
       
    });
});

myServer.listen(8000, () => console.log("server started on port 8000"));