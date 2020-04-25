
const express= require("express")
const  app=express();
const phonebook=require("./Database/database")
const auth=require("./Database/auth")
const multer=require("multer")

var path = require('path');
var bodyParser=require("body-parser")
var cookieparser=require("cookie-parser")
var mongoose=require("mongoose")
var methodOverride=require("method-override")

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieparser())
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

app.get("/",function(req,res){
    res.render("sign_up")
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split('/')[1];
  
      cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
    },
  });
  
  const upload = multer({ storage });
  

app.get("/show",auth.protect,function(req,res){
phonebook.find({User_ID:req.user.id},null,{sort:{Name:1}},function(err,Data){
        res.render("show",{Data:Data})
    })

})

mongoose.connect("mongodb://localhost/phonebook_database",{ useNewUrlParser: true });

app.get("/show",function(req,res){
    res.render("show");
})

app.get("/login",function(req,res){
    res.render("login")
})
app.post("/",auth.signUp)

app.post("/login",auth.login)

app.get("/create",function(req,res,next){
    res.render("Create");
})

app.post("/form_data",auth.protect,upload.single("myfile"),function(req,res,next){
    console.log("data is",req.file)
    
    phonebook.create({
        Img_Source:req.file.filename,
        Name:req.body.first.toLowerCase(),
        Address:req.body.second,
        Landline:req.body.third,
        Cell_phone_no:req.body.fourth,
        Work_phone_no:req.body.fifth,
        User_ID:req.user.id

    },function(err,newData){
      if(err)
        return next(err)
    
    console.log("data SAVED",newData)
  
    res.redirect("/show")
        })
})

app.get("/edit_data/:id",function(req,res){
    console.log("---->",req.params.id)
    phonebook.findById(req.params.id,(err,data)=>{
        if(err){
          res.send("Data not found");
        }
    
        console.log("data to update",data)
      res.render("edit",{data:data})
    
      })
    
    
    })

    app.put("/update_data/:id",upload.single("myfile"),function(req,res){
    console.log(req.file)    
    var obj={
            Img_Source:req.file.filename,
            Name:req.body.first.toLowerCase(),
            Address:req.body.second,
            Landline:req.body.third,
            Cell_phone_no:req.body.fourth,
            Work_phone_no:req.body.fifth
        }
        phonebook.findByIdAndUpdate(req.params.id,obj,function(err,data_updated){
            if(err){
                res.send(err)
            }
    
    res.redirect("/show")
        })
    })


    app.delete("/delete_data/:id",function(req,res){
        phonebook.findByIdAndRemove(req.params.id,function(err){
            if(err)
            {
                console.log(err)
            }
            else{
                res.redirect("/show")
            }
        })
    })
    
    app.get("*",function(req,res,next){
         res.render("notfound")
    })

app.use(function(err,req,res,next){
    if (err.name ==="ValidationError"){
        res.send(err.message)
    }
    if (err.code===11000){
        let error=''
        Object.keys(err.keyValue).forEach(function (keys) {
            error =error+keys+''
        })
        res.send('duplicate fields :'+error)
    }
    res.send("ERROR")
})





app.listen(1111,function(){
    console.log("server is on")
})
