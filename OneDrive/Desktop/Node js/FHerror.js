//common error
// ENOENT= FILE NOT EXIST
// EACCES= PERMISSION DENIED
// EEXIST= FILE ALREADY EXIXTS
// EISDIR= FILE EXPECTED, FOLDER NOT EXIST

//Error handling with call back

// const fs= require("fs");
// fs.readFile("./notes.txt","utf-8",( err,data)=>{
//     if(err){
//         if(err.code === "ENOENT"){
//             console.log("file not found");
//     }
//     return;
// }
// console.log(data)
// });


//error handling with async and await
// const fsPromises= require("fs").promises;
// async function readFileSafe(){
//     try{
// const data= await fsPromises.readFile("./data.txt","utf-8");
// console.log(data);
//     }
//     catch(err){
//         console.log("Error:", err.code);
//     }
//     }

//Stream Error handling

const readStream= fs.createReadStream("./sample.txt");
const writeStream=fs.createWriteStream("./source.txt");

readStream.on("error",(err)=>{
    console.log("Write error:", err.message);
    writeStream.destroy();
});

writeStream.on("error",(err)=>{
    console.log("write error:",err.message);
    readStream.destroy();
});