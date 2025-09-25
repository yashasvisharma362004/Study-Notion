const Profile = require("../models/Profile");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async(req,res)=>{
    try {
        const{
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body;

        const id = req.User.id;
        //find the profile by id
        const updateUserDetails = await User.findById(id).populate("additionalDetails").exec();
        
    } catch (error) {
        
    }
}

