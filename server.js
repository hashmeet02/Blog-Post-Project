/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ______________________ Student ID: ______________ Date: ________________
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 
var b
log_service=require("./blog-service")
var express=require("express");

var path=require("path")
var app= express();
app.use(express.static("public"));

var HTTP_PORT= process.env.PORT||8080

function onHTTPStart(){
    console.log("Express http server listening on "+ HTTP_PORT)
}

app.use(express.static('public'));

app.get("/", function(req,res){
    res.redirect('/about');
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function(req,res){
    blog_service.getPublishedPosts().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    });
});

app.get("/posts", function(req,res){
    blog_service.getAllPosts().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    });   
});

app.get("/categories", function(req,res){
    blog_service.getCategories().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    }); 
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404page.html"));
});

blog_service.initialize().then(function(){
    app.listen(HTTP_PORT, onHTTPStart);
}).catch(function(err){
    console.log('Unable to start the server: '+err);
});