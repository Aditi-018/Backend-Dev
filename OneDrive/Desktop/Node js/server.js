const http = require("http");
const fs=require("fs");
const myServer = http.createServer((req,res)=>{
    let respone= 
    console.log =`${Date.now()}: ${req.url} New Request Rec.\n`;}
    fs.appendFile("log.txt",log,error,data )=>{
        // 5 switch case
        switch(req.url){
            case '/':
                res.end("home page");
                break;
            case '/about':
                res.end("about page");
                break;  
            case '/contact':
                res.end("contact page");
                break;
            default:
                res.end("404 page not found");  
                break;
        }
        // res.end("Hello from my server");
    
     
myServer.listen(8000,()=>
    console.log("Server started "));
    }
