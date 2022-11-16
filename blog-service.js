const Sequelize = require('sequelize');
var sequelize = new Sequelize('hxelrhxz', 'hxelrhxz', 'Z7GuRe_Jk7ZDDZXFf1cPYUvogEMlK5LC', {
    host: 'heffalump.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Category= sequelize.define('Category',{
    category:Sequelize.STRING
});

var Post= sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize=function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            resolve("connected to database");
        }).catch(()=>{
            reject("unable to sync the database");
        });
    });

}
module.exports.getAllPosts=function(){
    return new Promise((resolve, reject) => {
        Post.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });

}
module.exports.getPublishedPosts=function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });

}
module.exports.getCategories=function(){
    return new Promise((resolve, reject) => {
        Category.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });

}

module.exports.addPost=function (postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for(var d in postData){
            if(postData[d]=='') postData[d] = null;
        }
        postData.postDate=new Date();
        Post.create(postData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to create post");
        });
    });

}

module.exports.getPostsByCategory=function(cat){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category: cat
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });

}

module.exports.getPostsByMinDate=function(minDateStr){
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        })
    });
}

module.exports.getPostById=function(p_id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id:p_id
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("no results returned.");
        });
    });

}

module.exports.getPublishedPostsByCategory=function(cat){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true,
                category: cat
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

module.exports.addCategory=function (categoryData){
    return new Promise((resolve, reject) => {
        for(var d in categoryData){
            if(categoryData[d]=='') categoryData[d] = null;
        }
        Category.create(categoryData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to create category");
        });
    });
}

module.exports.deleteCategoryById=function (cat){
    return new Promise((resolve, reject) => {
        Category.destroy({
            where:{id:cat}
        }).then(()=>{
            resolve("destroyed");
        }).catch((err)=>{
            reject("unable to destroy category");
        });
    });

}

module.exports.deletePostById=function (p_id){
    return new Promise((resolve, reject) => {
        Post.destroy({
            where:{id:p_id}
        }).then(()=>{
            resolve("destroyed");
        }).catch((err)=>{
            reject("unable to destroy post");
        });
    });

}