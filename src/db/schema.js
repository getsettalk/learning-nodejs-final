const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// define schema 
const stuSchma = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw Error(" Email is Wrong")
            }
        }
    },
    name:{
        type:String,
        trim:true,
        required:true
    },
    rollno:{
        type:Number,
        trim:true,
        required:true,
        unique:true,
        validate(val){
            if(val <=0){
                throw Error("Roll Number should be grater than  0")
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        maxlength:[10," Phone Number should be only 10 digit"]
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
    
})
// generating token
stuSchma.methods.generateAuthToken= async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.SEC_KEY);
        this.tokens= this.tokens.concat({token:token})
        // waiting for response after save method run
        await this.save();
        return token;
    }catch(e){
        res.send(e)
        console.log(e)
    }
}

// encrypting password
stuSchma.pre("save",async function(next){
    if(this.isModified("password")){
        // console.log(`the just pass: ${this.password}`)  
        this.password = await bcrypt.hash(this.password,10);
        // console.log(`the new pass: ${this.password}`)  
    }

    next();
})

// create collection and set schema
const  StudentModel =  mongoose.model("student",stuSchma)

module.exports = StudentModel;