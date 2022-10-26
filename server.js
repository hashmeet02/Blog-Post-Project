/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hashmeet Singh Saini    Student ID: 153070214       Date: 26 October 2022
*
*
********************************************************************************/ 

var blog_service = require("./blog-service");
var express = require("express");
const path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars'); 
const { mainModule } = require("process");
const stripJs = require('strip-js');
app.engine(".hbs", exphbs.engine({ extname: ".hbs",
helpers:{
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    },
    safeHTML: function(context){
        return stripJs(context);
    }
    
}
}));
app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

cloudinary.config({
    cloud_name: 'dr5xws2hc',
    api_key: '496944954185854',
    api_secret: 'BwOUoBZEdsn8LAQtAWB8rXr06H0',
    secure: true
});

const upload = multer();

function onHttpStart() {
	console.log(`Express http server listening on: ${HTTP_PORT}`);
}

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render("about",{layout:"main.hbs"});
    //res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});


app.get("/posts/add", (req, res) => {
    res.render("addPost",{layout:"main.hbs"});
    //res.sendFile(path.join(__dirname , '/views/addPost.html'));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addPost(req.body).then(() => {
            res.redirect("/posts");
        })
    
    });
    
});

app.get("/posts", (req, res) => {
    if (req.query.category){
        blog_service.getPostsByCategory(req.query.category).then((data)=>{
            res.render("posts", {posts: data});
            // res.json(data);
        }).catch(function(err){
            // res.json({message: err});
            res.render("posts", {message: "no results"});
        })
    }else if(req.query.minDate){
        blog_service.getPostsByMinDate(req.query.minDate).then(data=>{
            // res.json(data);
            res.render("posts", {posts: data});
        }).catch(function(err){
            // res.json({message: err});
            res.render("posts", {message: "no results"});
        })
    }else{
        blog_service.getAllPosts().then((data) => {
            // res.json(data);
            res.render("posts", {posts: data});
        }).catch((err) => {
            // res.json({message:err});
            res.render("posts", {message: "no results"});
        });
    }

});

app.get('/post/:value', (req, res)=>{
    blog_service.getPostById(req.params.value).then(data=>{
        res.json(data);
    }).catch((err)=>{ 
        res.json( {message: err});
    });
});

app.get("/categories", (req, res) => {
    blog_service.getCategories().then((data) => {
        res.render("categories", {categories: data});
        // res.json(data);
    }).catch((err) => {
        res.render("categories", {message: "no results"});
        // res.json({message: err});
    })
});

app.use((req, res) => {

    res.status(404).render("404page",{layout:"main.hbs"});
})


blog_service.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log(`Unable to start server: ${err}`);
});