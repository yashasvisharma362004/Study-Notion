const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//get CourseDetails 
exports.getCourseDetails = async (req,res) =>{
    try {
        //getId
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find({_id:coursed})
        .populate({
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
    })
    .populate("category")
    .populate("ratingAndReviews")
    .popululate({
        path:"courseContent",
        path:"subSection"
    }).exec();
        
    //validation
    if(!courseDetails){
        return res.status(400).json({
            success:false,
            message:"Course not found with ${courseId"
        });
    }
    //return response
    return res.status(200).json({success:true,message:"Course Details fetched successfully",data:courseDetails});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error.message});
    }
}