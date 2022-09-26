const { resolve } = require("path");
const fs = require("fs");
let posts=[]; 
let categories=[];
module.exports.initialize=function(){
    return new Promise((resolve,reject)=>{
        var flag1=true;
        var flag2=true;

        fs.readFile('./data/posts.json', (err, data) => {
            if (err){
                flag1=false;
            } 
            else{
                posts = JSON.parse(data);
            }
        });
        fs.readFile('./data/categories.json', (err, data) => {
            if (err){
                flag2=false;
            } 
            else{
                categories = JSON.parse(data);
            }
        });
        if (flag1 && flag2) resolve('operation was a success');
        else reject("unable to read file.")
    });

        
    // return new Promise((resolve,reject)=>{
    //     fs.readFile('./data/categories.json', (err, data) => {
    //         if (err){
    //             reject();
    //         } 
    //         else{
    //             categories = JSON.parse(data);
    //             resolve();
    //         }
    //     });
    // });
    // var posts = require("./data/posts.json");
    // var categories = require("./data/categories.json");
}
module.exports.getAllPosts=function(){
    return new Promise((resolve,reject)=>{
        if(posts.length==0){
            reject("no results returned");
        }
        else{
            resolve(posts);
        }
    });
}
module.exports.getPublishedPosts=function(){
    return new Promise((resolve,reject)=>{
        let publishedPosts=posts.filter(post=>post.published===true);
        if(publishedPosts.length==0){
            reject("no results returned");
        }
        else{
            resolve(publishedPosts);
        }
    });
}
module.exports.getCategories=function(){
    return new Promise((resolve,reject)=>{
        if(categories.length==0){
            reject("no results returned");
        }
        else{
            resolve(categories);
        }
    });
}