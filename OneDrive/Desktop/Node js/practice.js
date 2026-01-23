const greet= ()=>{
    console.log("morning");
}
function fun(cb){
    console.log("this is fun function");
    cb();
}
fun(greet);
fun(() =>{
    console.log("GlA");
})