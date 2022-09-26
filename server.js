var blog_service=require("./blog-service")
var express=require("express");

// var posts = require("./data/posts.json");
// var categories = require("./data/categories.json");

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
    // res.send("TODO: get all posts who have published==true");
    // let array=posts.filter(post=>post.published===true);
    // res.send(array); 
    blog_service.getPublishedPosts().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    });
});

app.get("/posts", function(req,res){
    // res.send("TODO: get all posts");
    // res.send(posts);
    blog_service.getAllPosts().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    });   
});

app.get("/categories", function(req,res){
    // res.send("TODO: get all categories");
    // res.send(categories);
    blog_service.getCategories().then((data)=>{
        res.json(data);
    }).catch(function(err){
        console.log("message: "+err);
    }); 
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404page.html"));
});

// app.listen(HTTP_PORT, onHTTPStart);
blog_service.initialize().then(function(){
    app.listen(HTTP_PORT, onHTTPStart);
}).catch(function(err){
    console.log('Unable to start the server: '+err);
});