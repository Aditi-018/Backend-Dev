function login(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("login")
            resolve() //yaha reject karoge to undedefined aayega kuki data ko fetch hi nahi kar payega isliye
        },2000)
    })
}
function userDetails(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("user details")
            resolve()
        },1000)
    })
}
function password(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log("password")
            resolve()
        },2000)
    })
}


//call back problem ko solve karne ke liye promise use karte h
//promise using then keyword

// login()
// .then(()=>{
//     return userDetails()
//  }) .then(()=>{
//     return password()

//     })
// .then(()=>{
//     console.log("alltask are done")
// })
// .catch(error => {
//     console.log( error);
// })



//async await

async function run(){
    try{
        await login()
        await userDetails() //async function ke andar hi await use kar sakte h karna jaruri h if await nhi chaloge to async ko nhi pata ki
        await password()
    }
    catch(error){
        console.log(error)
    }
}
run()