const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/StudentApp")
.then(()=>{
    console.log("Db connected success !!!")
}).catch((e)=>{
    console.log("Falid to connect with db")
})
