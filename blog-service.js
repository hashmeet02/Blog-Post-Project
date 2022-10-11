const e = require('express');
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
}
module.exports.getAllPosts=function(){
    return new Promise((resolve,reject)=>{
        if(posts.length==0){
            reject("no results returned");
        }
        else{
            resolve(posts);
        }
    })
}
module.exports.getPublishedPosts=function(){
    return new Promise((resolve,reject)=>{
        let publishedPosts=posts.filter((post)=>post.published===true);
        if(publishedPosts.length==0){
            reject("no results returned");
        }
        else{
            resolve(publishedPosts);
        }
    })
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

module.exports.addPost=function (postData){
    return new Promise(function(resolve,reject){
        // if(postData.published==undefined){
        //     postData.published=false;
        // }
        postData.id=posts.length +1;
        postData.published=(postData.published)? true:false;
        posts.push(postData);
        resolve();
        console.log("added post");
    });
}

module.exports.getPostsByCategory=function(category){
    return new Promise((resolve,reject)=>{
        let catPosts=posts.filter((post)=>post.category==category);
        if(catPosts.length==0){
            reject("no results returned");
        }
        else{
            resolve(catPosts);
        }
    })
}

module.exports.getPostsByCategory=function(category){
    return new Promise((resolve,reject)=>{
        let catPosts=posts.filter((post)=>post.category==category);
        if(catPosts.length==0){
            reject("no results returned");
        }
        else{
            resolve(catPosts);
        }
    })
}

module.exports.getPostsByMinDate=function(minDateStr){
    var minDateArr =[];
    return new Promise(function(resolve, reject){
        for(var i=0; i<posts.length; i++){
           if(new Date(posts[i].postDate) >=new Date (minDateStr)){
               minDateArr.push(posts[i]);
           }   
        }
        if(minDateArr.length ==0){
            reject("no result returned");
        }else{
            resolve(minDateArr);
        }        
    });
}

module.exports.getPostById=function(id){
    return new Promise((resolve,reject)=>{
        let postById=posts.filter((post)=>post.id==id);
        if(postById.length==0){
            reject("no results returned");
        }
        else{
            resolve(postById[0]);
        }
    })
}
// module.exports.getPostsByMinDate=function(minDate){
//     return new Promise((resolve,reject)=>{
//         let minDatePosts=posts.filter((post)=>post.category==category);
//         if(publishedPosts.length==0){
//             reject("no results returned");
//         }
//         else{
//             resolve(publishedPosts);
//         }
//     })
// }