const express = require('express');
require('dotenv').config()
const app = express();
const path = require('path');
// const  hbs = require('hbs');
const  ejs = require('ejs');
const cookieParser = require('cookie-parser')
require("./db/conn");
const StudentModel = require('./db/schema');
const bcrypt = require('bcryptjs');
const Port = process.env.Port || 3000;
const session = require('express-session');
const flash = require('connect-flash');
const auth = require('./middlewere/auth');
// path define variable
const staticPath = path.join(__dirname,"../public");
const partialPath = path.join(__dirname,"../views/partials");

app.use(session({
    secret:"message",
    cookie:{maxAge:90000},
    saveUninitialized:false,
    resave:false
}));

app.use(flash());
// used as a middleware cookie parser
app.use(cookieParser());

// setting up engine and default with static files
app.use(express.static(staticPath));
app.use(express.json());
app.use(express.urlencoded({extended:false})) ;

// ejs.registerPartials(partialPath)
app.set("views","./views");
app.set("view engine","ejs");


// comming traffic url to serve 
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/sec',auth,(req,res)=>{
   // console.log(`Our cokkie id of token ${req.cookies.jwtLogin}`);
    res.render('sec',{
        cdata:req.cookies.jwtLogin
    })
})



app.get('/login',(req,res)=>{
    res.render('login',{
        message:req.flash('success')
        
    })
})

app.get('/logout',auth, async(req,res)=>{
    try{
        // logout single  user from only browser
       /*  res.clearCookie("jwtLogin");
        console.log(res.user)
        console.log("loged out user successfully");
        await res.user.save();
        res.send("loged out ......") */

        // secure logout from database with the help of filter method
      //  console.log(req.user)
        req.user.tokens= req.user.tokens.filter((currentElement) =>{
            return currentElement.token !==req.token
        })
        res.clearCookie("jwtLogin");
      //  console.log("loged out user final successfully");
        await req.user.save();
        res.send("loged out finaaly .....") 

    }catch(e){
        console.log(e)
        res.send(e)
    }
})


app.get('/register',(req,res)=>{
    res.render('register',{
        message:req.flash('success')
    })
})

// code for register student
app.post('/register',async (req,res)=>{
try{
    const email = req.body.email;
    const sname = req.body.sname;
    const rollno = req.body.rollno;
    const phone = req.body.phone;
    const gender = req.body.gender;
    const pass = req.body.pass;
    
        const user =new StudentModel({
            "email":email,
            "name":sname,
            "rollno":rollno,
            "phone":phone,
            'gender':gender,
            "password":pass
        });
    // like a middlewere cratede custome function
        const token = await user.generateAuthToken();
        // console.log(`this register token is: ${token}`)

    /*     // setting cookie default
    // at the registration no need to set cookie
        res.cookie("jwtLogion",token,{
            expires:new Date(Date.now() + 900000),
            httpOnly:true
            // secure:true
        }) */

        const newData = await user.save();
        req.flash('success',"Your Registration has been Successfully done ! now you can login");
        // console.log(newData);
        res.status(201).redirect('/login');

}catch(e){
    console.log(e);
    res.status(406).send(e.message);
}
})

// code for login
app.post('/login',async (req,res)=>{
    try{
        // console.log(req.body)
        var email = req.body.email;
        var pass = req.body.password;
     
        if(email =='' ||  req.body.password == ''){
            res.status(401).send('Invalid data or empty data submited,<a href="/login"> go back </a> ')
        }else{

            const useremail  =  await StudentModel.findOne({email:email});
            //console.log(useremail)
            if(useremail !== null){
                  // password hashing 
            const isMatch = await bcrypt.compare(pass ,useremail.password)
            // compaire both password
            
         
            
            if(isMatch){
                // again generate token on login set new token
                const token = await useremail.generateAuthToken();
                // console.log(`this token  login is: ${token}`)
                res.cookie("jwtLogin",token,{
                    expires:new Date(Date.now() + 900000),
                    httpOnly:true
                })
                // console.log(` our cokkie id of token ${req.cookies.jwtLogin}`);
                res.status(200).render("index")
                }else{
                    res.status(401).send("Password is wrong , failed to login")
                }
            }else{
                res.status(401).send("user not found with this userid")
            }
          

        }
    }catch(e){
        console.log(e)
    }
  
})

  
// listining
app.listen(Port, ()=>{
    console.log("listing");
})