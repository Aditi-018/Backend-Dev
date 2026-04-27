const express = require("express");
const app=express();
app.use(express.json());
let students=[
    {id:1,name:"Apeksha",marks:10,city:"AMathura"},
    {id:2,name:"Gunnu",marks:20,city:"Agra"},
    {id:3,name:"Gungun",marks:30,city:"Delhi"}
];
app.get("/students",(req,res)=>{
    res.json(students);
});
//Delete - Remove Students 
app.delete("/students/:id",(req,res)=>{
    const id = req.params.id;
    const index = students.findIndex((s)=>s.id==id);
    if(index===-1){
        return res.status(404).json({message:"Student not found"});
    }
    const deleteStudent=students.splice(index,1);
    console.log(deleteStudent);
    res.json({
        message:"Student delted successfully",deleteStudent:deleteStudent[0],
    });
});
app.listen(5000,()=>console.log("Server Started"));