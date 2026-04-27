const express = require("express");
const app = express();
app.use(express.json());
let credentials=[
    {email: "yash@gmail.com", password:"1233"},
    {email: "class@gmail.com", password:"4566"}
];
app.get("/auth/users",(req,res)=>{
    res.json({message:"user fetch successfully",credentials});
});

//rest password route
//put : update and modify 
app.put("/auth/reset", (req,res)=>{
    const {email,password,newpassword}=req.body;
    // find user 
    const user = credentials.find(
        (cred)=> cred.email == email && cred.password == password,
    );
    //check user exits or not 
    if(!user)
    {
        return res.status(400).json({message:"Inavlid"})
    }
    // update password
    user.password=newpassword;
    res.json({message:"Password updated successful",user})
});

//forget password
app.put("/auth/forget",(req,res)=>{
    const {email,newpassword}=req.body;
    const user = credentials.find((cred)=>cred.email==email);
    if(!user){
        return res.status(400).json({message:"Email not found"});
    }
    user.password = newpassword;
    res.json({message:"password reset via forget-password",user});
});
app.listen(8000,()=>console.log("server started"));