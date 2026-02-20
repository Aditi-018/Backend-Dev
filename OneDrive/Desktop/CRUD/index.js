const express=require("express");
const fs=require("fs");
const users= require("./MOCK_DATA.json");
const app= express();


app.use(express.json());


app.get("/user",(req,res)=>{
    const html=`
    <ul>
    ${users.map((user)=>`<li>${user.first_name} ${user.last_name}</li>`).join("")}
    </ul>
    `;
    res.send(html);
});

//REST API
app.get('/api/users',(req,res)=>{
    res.json(users);
})
app.get('/api/users/:id',(req,res)=>{
    const id=req.params.id;
    const user=users.find((u)=> u.id==id);
    return res.json(user);
})
//post method
app.post("/api/users",(req,res)=>{
     //TODO: Create new user
    const body= req.body;
    const newUser={id: users.length+1,...body,};
    users.push(newUser);
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(users,null,2),err=>{
        if(err){
            return res.status(500).json({msg:"ERROR saving user"});
        }
    return res.status(201).json({msg:"user created successfully",user: newUser});
    });


app.patch("/api/users/:id",(req,res)=>{
    const id=Number(req.params.id);
    const body=req.body;
    const userIndex=user.findIndex((u)=>u.id ===id);
    if(userIndex === -1){
        return res.status(404).json({msg:"user not found"})
    }
    users[userIndex]={...users[userIndex],...body};
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(users,null,2),(err=>{
        if(err)
            return res.status(500).json({msg:" Error updating user"});
    }));
    //TODO: update the  user with given  id
    return res.json({msg:"User updated successfully", user:users[userIndex],})
});
});


app.listen(8080,()=> console.log("Server started"));
