const http=require("http");
const fs=require("fs");
const { log } = require("console");
const myServer=http.createServer((req,res)=>{
    let responseText="";
    
    switch(req.url){
        case "/":
            responseText="home page";
            break;
            case "/about":
                responseText="about page";
                break;
                case "/contact":
                    responseText="contact page";
                    break;
                    default:
                        responseText="404 page not found";
                        break;
                    }
                    fs.appendFile("log.txt",log,(err)=>{
                        if(err){
                            console.log("error in logging");
                        }
                        res.end(responseText);
                    });
     
const log=`${Date.now()} |${req.url} | ${responseText}\n`;
// const log(log,data);
responseText=("hello from server");    
});

myServer.listen(8000,()=>console.log("server started"));