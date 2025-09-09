const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
//const { memo } = require("react");

//send otp function
exports.sendOTP = async (req,res)=>{
    try {
        const {email} = req.body;//fetch email from req ki body
    //check if user already exist
    const checkUserPresent = await User.findOne({email});
    if(checkUserPresent){
        return res.status(401).json({success:false,message:"User already registered"})
    }

    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    })
    console.log("otp generated ",otp);
    //check unique otp or not
    let result = await OTP.findOne({otp:otp});
    while(result){
        //generate otp
     otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });
    //check unique otp or not
    const result = await OTP.findOne({otp:otp});
    }
    //unique otp gen kar liya h merko iski entry database mein karni h
    const otpPayload = {email,otp}

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody)

    //return response sucessfull
    res.status(200).json({
        sucess:true,
        message: "OTP Sent Sucessfully",
        otp,
    })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//signUp
exports.signUp = async (req,res)=>{
    try {
        //data fetch from req ki body
    const {firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
    } = req.body;
    //validate karlo
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            sucess:false,
            message:"All fields are required",
        })
    }
    //2 pass match karlo
    if(password !== confirmPassword){
        return res.status(400).json({
            sucess:false,
            message:"Password and confirmPassword Value does not match Please try again"
        })
    }
    //check user already exist or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            sucess:false,
            message:"User is already Registered"
        })
    }
    //find most recent otp stored for the user
    const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);

    //validate OTP
    if(recentOtp.length == 0){
        //otp not found
        return res.status(400).json({
            sucess:false,
            message:"OTP Not Found",
        })
    }else if(otp !== recentOtp.otp){
        //Invalid OTP
        return res.status(400).json({
            sucess:false,
            message:"Invalid OTP",
        })
    }

    //Hash Password
    const hashedPassword  = await bcrypt.hash(password,10)
    //entry created in db
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    })
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https//api.dicebear.com/5.x/initials/svg?seed${firstName} ${lastName}`,
    })
    //return res
    return res.status(200).json({
        success:true,
        message:"User is registered Successfully",
        user,
    })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. please try again"
        })
    }
}

//login
exports.login = async(req,res)=>{
    try {
        //get data from req ki body
        const {email,password} = req.body;
        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        //generate jwt,after pass matching
        //create cookies and send response
    } catch (error) {
        
    }
}