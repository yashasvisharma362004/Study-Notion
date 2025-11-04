const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true, // modern URL parser
        useUnifiedTopology:true,  // modern topology engine
    })
    .then(()=>console.log("DB connect Sucessfully"))
    .catch((error) => {
        console.log("DB Connection failed");
        console.error(error);
        process.exit(1);
    })
}
module.exports = dbConnect;
//Any part of your project that needs a database connection just imports this.