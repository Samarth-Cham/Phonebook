
var mongoose=require("mongoose")
var phonebook=new mongoose.Schema({
Img_Source:{type:String}, 
Name:{type:String,required:[true,'a user must have an name'],minlength:7},
Address:{type:String},
Landline :{type:Number,unique:true},
Cell_phone_no:{type:Number,unique:true},
Work_phone_no:{type:Number,unique:true},
User_ID:{type:String}   
})

module.exports=mongoose.model("phonebook",phonebook)