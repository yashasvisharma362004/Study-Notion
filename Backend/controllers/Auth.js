const User = require("../models/User")
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

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
        //if user not found with provided email
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not Registered with Us Please SignUp to Continue",
            })
        }
        //generate jwt,after pass matching
        if(await bcrypt.compare(password,user.password)){
            const token = Jwt.sign({
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            },
        process.env.JWT_SECRET,
        {
            expiresIn:"24h",
        }
    )
       // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}

// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    const result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
    }
    const otpPayload = { email, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

//controller for changing password
exports.changePassword = async(req,res){
    try {
        //get user data from req.user
        const userDetails = await User.findById(req.user.id);
        // Get old password, new password, and confirm new password from req.body
        const {oldPassword,newPassword} = req.body
        //validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,userDetails.password
        )
        if(!isPasswordMatch){
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({
                success:false,
                message:"the password is incorrect"
            })
        }
        //update password
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password:encryptedPassword},
            {new:true}
        )
        //send notification email
    try{
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}