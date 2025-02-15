const express=require('express');
const path=require('path');
const expressApp=express();
expressApp.set("views",path.join(__dirname,"views"));
expressApp.use(express.static("public"));
expressApp.use(express.urlencoded({extended:false}));
expressApp.set("view engine","ejs");
const session=require('express-session');
expressApp.use(session({
    secret:'testSecret',
    resave:false,
    saveUninitialized:true
}));

const mongoose=require('mongoose');
const {emit}=require('process');

expressApp.get('/',(req,res)=>
{
    res.render("home");
});
expressApp.get('/aboutus',(req,res)=>
{
    res.render("aboutUs");
});
expressApp.get('/newsletter',(req,res)=>
{
    res.render("newsletter");
});
expressApp.get('/community',(req,res)=>
{
    res.render("community");
});
expressApp.get('/register',(req,res)=>
    {
        res.render("register");
    });
    expressApp.get('/jobOpportunities',(req,res)=>
        {
            res.render("jobOpportunities");
        });
expressApp.get('/location',(req,res)=>
            {
                res.render("location");
            });
const port=5050;
expressApp.listen(port);
console.log("Listening to http://localhost:"+port);