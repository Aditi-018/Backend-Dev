const url = require("url");
const http = require("http");

const myServer = http.createServer((req,res)=>{
    const myUrl = url.parse(req.url,true);
    console.log(myUrl);
    switch(myUrl.pathname){
        case "/":
            res.end("this is home page");
            break;
        case "/about":
            const aa= res.end("this is about page");
            const username=myUrl.query.myname;
            res.end(`Hi ${username}`)
            break;
        case "/contact":
            res.end("this is contact page");
            break;
        default:
            res.end("404");

    }
})

myServer.listen(8000,()=> console.log("server started"));
