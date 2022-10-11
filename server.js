/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Hashmeet Singh Saini    Student ID: 153070214       Date: 10 October 2022
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 

var blog_service = require("./blog-service");
var express = require("express");
const path = require("path");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

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

app.get("/", (req, res) => {
    res.redirect('/about');
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get("/blog", (req, res) => {
    blog_service.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname , '/views/addPost.html'));
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
            res.json(data);
        }).catch(function(err){
            res.json({message: err});
        })
    }else if(req.query.minDate){
        blog_service.getPostsByMinDate(req.query.minDate).then(data=>{
            res.json(data);
        }).catch(function(err){
            res.json({message: err});
        })
    }else{
        blog_service.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message:err});
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
        res.json(data);
    }).catch((err) => {
        res.json({message: err});
    })
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404page.html'));
})


blog_service.initialize().then(function() {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function(err) {
    console.log(`Unable to start server: ${err}`);
});