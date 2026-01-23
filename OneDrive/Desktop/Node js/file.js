const fs=require("fs");
fs.writeFileSync("./example.txt","hello world");
// const results =fs.readFileSync("./unknown.txt","utf-8");
// console.log(results);
// fs.readFile("umknown.txt","utf-8",(err,result)=>{
//     if(err){
//         console.log("Error reading files:", err);}
//     else{
//         console.log("File content",result);
//     }

//blocking /syncrounuous code
console.log("1");
const results =fs.readFileSync("./umknown.txt","utf-8",err);
console.log(
    console.log("2");
)
//non blocking jsiki memory sabse kam  hogi usko sabse phele print hoga

// });
fs fs.appendFile("./example.txt","$date.now()",(err)=>{
   fs.mkdirSync("./my-docs/a/b",{recursive:true});} //folder or uske sun folders bananane ke liye
