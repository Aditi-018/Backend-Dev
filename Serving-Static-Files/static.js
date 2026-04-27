const express = require("express");
const app = express();


//serve files from 'public' directory 

//Absolute path: c\USER\DEKSTOP\FILENAME
//Relative Path: ./public

//const staticPath = __dirname + "/public"

app.use(express.static("public"));

app.listen(8000,() =>  console.log("Server Started"));

















