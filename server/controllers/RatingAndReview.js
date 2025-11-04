const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//create Rating
exports.createRating = async(req,res)=>{
    try {
        //get userId
        const userId = req.user.id;
        //fetch data from req ki body
        const {rating,review,courseId} = req.body;
        //check if user is enrolled or not
        const courseDetails = await Course.findOne({_id:courseId,
                            studentsEnrolled:{$elemMatch:{$eq:userId}}});//search for courseId and userId in studentsEnrolled array
            if(!courseDetails){
                return res.status(404).json({success:false,message:"Student is not enrolled in this course"});
        //check if user is already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
    }
        if(alreadyReviewed){
            return res.status(403).json({success:false,message:"Course is already reviewed by the user"});
        }
            //create rating and review
    const ratingReview = await RatingAndReview.create({
        rating,review,
        course:courseId,
        user:userId,
    });
        //push the rating into course schema
       const updatedCourseDetails  = await Course.findByIdAndUpdate({_id:courseId},{
            $push:{ratingAndReviews:ratingReview._id,

            }
        },
    {new:true,});
        //return response
        return res.status(200).json({success:true,message:"Rating and Review created successfully",data:ratingReview});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error.message});
    }
}
//get Average rating
exports.getAverageRating = async(req,res)=>{
    try {
        //get courseId
        const courseId = req.body.courseId;

        //cal avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                },
            }
        ])
        //return rating
        if(result.length > 0){
            return res.status(200).json({success:true,message:"Average rating fetched successfully",data:result[0].averageRating});
        }
        //if no rating found
        return res.status(200).json({success:true,message:"Average rating 0 no rating given till now ",averageRating:0})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:error.message});
    }
}
//get All rating
exports.getAllratingAndReviews = async (req,res)=>{
    try {
        const allreviews = await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image",
        })
        .populate({
            path:"course",
            select:"courseName",
        })
        .exec();
        return res.status(200).json({success:true,message:"All reviews fetched successfully",data:allreviews});
    } catch (error) {
      console.log(error);
        return res.status(500).json({success:false,message:error.message});
    }
}