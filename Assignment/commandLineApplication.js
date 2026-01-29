const fs=require("fs");
//read file
fs.readFile("input.txt","utf8",(err,data) => {
    if(!err) console.log("Read:", data);
});
//write file
fs.writeFile("output.txt","hello world","utf8",() =>{
    console.log("File written")
});
//copy file 
fs.copyFile("out.txt","copy.txt", () => {
    console.log("File copied");
});
//Delete file
fs.unlink("copy.txt",() => {
    console.log("File deleted");
});

//List Directory
fs.readdir(".",(err,files) => {
    console.log("Files in directory:");
    files.forEach(f => console.log(f));
});
