const http = require("http");
const fs= require("fs")

const myServer=http.createServer((req,res)=>{
    let response = "";
    switch(req,url){
        case "/":
            response="this is a homepage"
            break;
        case "/services":
            response="this is services page"
            break;
        case "/products":
            response="this is products page"
            break;
        default:
            response="error 404 page not found"
            
    }

})