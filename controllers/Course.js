const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//function to create course
exports.createCourse = async (req.res)=>{
    try {
        //get userId
        const userid = req.user.id;
        //get data from req.body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag:_tag,
            category,
            status,
            instructions:_instructions,
        } = req.body;
        //get thumbnail image from req files
        const thumbnail = req.files.thumbnail;
        //convert the instructions from string to array
        const tag = JSON.parse(_tag);
        console.log("instructions",instructions);
        //check if any of the required field is missing
        if(!courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag.length ||
            !category ||
            !thumbnail ||
            !instruction.length
        ){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        if(!status || status === undefined){
            status = "Draft"
        }
        //check if the user is an instructor
        const instructorDetails = await User.findById(userId,{
            accountType:"Instructor"
        });
        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"User is not an instructor",
            })
        }

        //check if the given tag is valid
        const categoryDetails = await Category.findById(category)
        if(!categoryDetails){
            return res.status(400).json({
                success:false,
                message:"Please provide a valid category",
            })
        }
        //upload the thumbnnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        console.log(thumbnailImage);
        //create a new course with the given details
        const newCourse = await Course.create({
            instructor: instructorDetails._id,
            courseName,
            courseDescription,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag,
            category:categoryDetails._id,
            status:status,
            instructions,
            thumbnail:thumbnailImage.secure_url,
        });
        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
        // Add a new course to the user Schema f the instructor
        await User.findByIdAndUpdate({
            _id:instructionDetails._id,
        },
        {
            $push:{
                courses: newCourse._id,
            }
        },
        {new:true}
    )
    //Add the new course to the categories
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

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