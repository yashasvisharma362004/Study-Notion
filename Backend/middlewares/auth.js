const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User")
//auth
//iske ander authentication check karte the json web token sahi h ya nhi
exports.auth = async(req,resizeBy,next)=>{
    try {
        //exract token
        //three methods of taking token
        const token = req.cookies.token 
                        || req.body
                        || req.headers("Authorisation").replace("Bearer",""); 
        //if token missing return res
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            })
        }
        //verify the token
        try {
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (err) {
            return res.status(401).json({
                success:false,
                message:"Token is invalid",
            })
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token"
        });
    }
}
//isStudent
exports.isStudent = async(req,res,next)=>{
try {
    if(req.user.accountType !== "Student"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for Students Only"
        })
    }
    next();
} catch (error) {
    return res.status(500).json({
        success:false,
        message:"User role cannot be verified,please try again"
    })
}
}
//isInstructor
exports.isInstructor = async(req,res,next)=>{
try {
    if(req.user.accountType !== "Instructor"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for Instructor Only"
        })
    }
    next();
} catch (error) {
    return res.status(500).json({
        success:false,
        message:"User role cannot be verified,please try again"
    })
}
}
//isAdmin 
exports.isAdmin = async(req,res,next)=>{
try {
    if(req.user.accountType !== "Admin"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for Admin Only"
        })
    }
    next();
} catch (error) {
    return res.status(500).json({
        success:false,
        message:"User role cannot be verified,please try again"
    })
}
}