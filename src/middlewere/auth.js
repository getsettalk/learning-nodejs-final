const jwt = require('jsonwebtoken');
const StudentModel = require('../db/schema');

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwtLogin;
        const verifyUser = await jwt.verify(token, process.env.SEC_KEY);
        //  console.log(verifyUser);
        const user = await StudentModel.findOne({_id:verifyUser._id})
        req.user = user;
        req.token = token;


        // console.log(user.name)
        next();
    }catch(e){
        res.status(401).send(e);
    }   
}

module.exports = auth;