const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
courseName:{
    type:String,
    required:true,
    trim:true,
},
courseDescription:{
    type:String,
    trim:true,
    required:true,

},
instructor:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
},
whatYouWillLearn:{
    type:String,
    required:true,
},
courseContent:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Section"
}
],
ratingAndReviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"RatingAndReview",
}
],
price:{
    type:String,
},
thumbNail:{
    type:String,
},
tag:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"tag",
},
studentEnrolled:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
}
]
})

module.exports = mongoose.model("Course",courseSchema);