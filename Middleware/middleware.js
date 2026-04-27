const  express = require("express");
const app = express();

app.use((req,res,next)=>{
    console.log("MiddleWare 1");
    next();
});

app.use((req,res,next)=>{
    console.log("MiddleWare 2");
    next();
});
app.use(express.static("public"));// use to run the peoject on the local host 
app.get("/test",(req,res)=>{
    res.send("Route executed");
});
app.listen(8000, ()=>  console.log("Server Started"));


// middleware is used to check req, authentication check, log check, acess control, data modification error render.

// 1- Application level middleware 


const  express = require("express");
//const app = express();

// 2- Built-in middleware 

app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use((req,res,next)=>{
    console.log("Request url:",req.url);
    console.log("Request Method:", req.method);
    next(); // next middleware can excess route 
});

app.get("/home",(req,res)=>{
    res.send("Welcome Home");
});

// 3- Route level middleware 
const checklogin = (req,res,next)=>{
    const isLoggedIn = true;
    if(!isLoggedIn){
        return res.status(401).send("Please Login First");
    }
    next();
};

app.get("/dashboard", checklogin,(req,res)=>{
    res.send("Welcome to Dashboard");
});


// 4- Authentication middleware

const authMiddleware =(req,res,next)=>{
    const token = req.headers.authorization;
    if(!token)
    {
        return res.status(403).json({message: "Token Required"});
    }
    if(token!="akku"){
        return res.status(401).json({message: "Invalid token"});
    }
    next();
};

app.get("/profile" , authMiddleware, (req,res)=>{
    res.json({message: "Profile data"});
});


// 5- Error Handling middleware

app.get("/error", (req,res)=>{
    throw new Error ("Something Went Wrong");
});

app.use((err, req,res,next)=>{
    console.log("Error Middleware:", err.message);
    res.status(500).json({message:"Internal Server Error"});
});


app.listen(8000, ()=>  console.log("Server Started"));

