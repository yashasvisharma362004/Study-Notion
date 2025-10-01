const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;

//database connection
database();
//middlewares
app.use(express.json());
app.use(cookieParser());
const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN)
  : ["*"];

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    maxAge: 14400,
  })
);
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
})
);
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("api/v1/profile",profileRoutes);
app.use("api/v1/payment",paymentRoutes);

//def route
app.get("/",(req,res)=>{
    return res.json({
    success:true,
    message:"Server is up and running",

    })
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})