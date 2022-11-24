/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: HASHMEET SINGH SAINI    Student ID: 153070214   Date: Nov 24th 2022
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 

var blog_service = require("./blog-service");
var authData = require("./auth-service");
var express = require("express");
const path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars'); 
const { mainModule } = require("process");
const stripJs = require('strip-js');
const clientSessions=require("client-sessions")
app.use(express.urlencoded({extended: true}));

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dr5xws2hc',
    api_key: '496944954185854',
    api_secret: 'BwOUoBZEdsn8LAQtAWB8rXr06H0',
    secure: true
});

const upload = multer();

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
    },
    formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }    
}
}));

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(clientSessions({
    cookieName:"session",
    secret: "WEB322_ass6",
    duration: 2 * 60 * 1000,
    activeDuration: 60 * 1000
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req,res,next){
    if(!req.session.user){
        res.redirect("/login");
    }else{
        next();
    }
}

function onHttpStart() {
	console.log(`Express http server listening on: ${HTTP_PORT}`);
}

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(()=>{
        res.render("register",{successMessage: "User created"}); //check this
    }).catch((err)=>{
        res.render("register",{errorMessage: err, userName: req.body.userName});
    })
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    }).catch((err)=>{
        res.render("login",{errorMessage: err, userName: req.body.userName})
    })
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render("about",{layout:"main.hbs"});
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

app.get("/posts",ensureLogin, (req, res) => {
    if (req.query.category){
        blog_service.getPostsByCategory(req.query.category).then((data)=>{
            if (data.length>0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }else if(req.query.minDate){
        blog_service.getPostsByMinDate(req.query.minDate).then(data=>{
            if (data.length>0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }else{
        blog_service.getAllPosts().then((data) => {
            console.log(data);
            if (data.length>0){
                res.render("posts", {posts: data});
            }
            else{
                res.render("posts", {message: "no results"});
            }
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        });
    }

});

app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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

app.get("/posts/add", ensureLogin,(req, res) => {
    blog_service.getCategories().then((data)=>{
        res.render("addPost",{layout:"main.hbs", categories:data});
    }).catch((err)=>{
        res.render("addPost", {categories: []}); 
    })
});

app.get('/blog/:id',ensureLogin, async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
            console.log(posts);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
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
        viewData.post = await blog_service.getPostById(req.params.id);
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

app.get('/post/:value',ensureLogin, (req, res)=>{
    blog_service.getPostById(req.params.value).then(data=>{
        res.json(data);
    }).catch((err)=>{ 
        res.json( {message: err});
    });
});

app.get("/categories", ensureLogin,(req, res) => {
    blog_service.getCategories().then((data) => {
        if (data.length>0){
            res.render("categories", {categories: data});
        }
        else{
            res.render("categories", {message: "no results"});
        }
    }).catch((err) => {
        res.render("categories", {message: "no results"});
    })
});

app.get("/categories/add", ensureLogin,(req, res) => {
    res.render("addCategory",{layout:"main.hbs"});
});

app.post("/categories/add",ensureLogin, (req, res) => {        
    blog_service.addCategory(req.body).then(()=>{
        res.redirect("/categories");
    }).catch((err)=>{
        res.json({message: err});
    });
});

app.get("/categories/delete/:id",ensureLogin, (req, res) => {
    blog_service.deleteCategoryById(req.params.id).then(() => {
        res.redirect("/categories");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found)");
    })
});

app.get("/posts/delete/:id",ensureLogin, (req, res) => {
    blog_service.deletePostById(req.params.id).then(() => {
        res.redirect("/posts");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Post / Post not found)");
    })
});

app.use((req, res) => {
    res.status(404).render("404page",{layout:"main.hbs"});
})

blog_service.initialize()
.then(authData.initialize)
.then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log(`Unable to start server: ${err}`);
});


