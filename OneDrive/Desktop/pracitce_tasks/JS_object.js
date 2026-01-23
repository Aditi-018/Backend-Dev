let user={
    name:"John",
    email:"john@example.com"
}

//JSon object

let json={
    "name":"John",
    "email":"john@example.com"
}


//JSON.stringify(user) js object -> json string
//JSON.prase() json string -> json data

//how to render JSON data

const server= http.createServer((req, res) => {
    res.writeHead(200, {
        "content=type": "application/json"
    });
// res.end(user):
res.end(JSON.stringify({
    ghj:"dsjsn",user
}));
})

server.listen(8000, ()=>{
    console.log("Server is running");
});
