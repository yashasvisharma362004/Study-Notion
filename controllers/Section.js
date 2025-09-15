const Section = require("../models/Section");
const course = require("../models/Course");

exports.createSection = async(req,res)=>{
    try {
        //data fetch
        const {sectionName,courseId} = req.body;
        //validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        // Create a new section with the given name
        const newSection = await Section.create({sectionName})
        //update couse with section objectId
        const updatedCouse = await Course.findByIdAndUpdate(
                                courseId,
                                {
                                    $push:{
                                        courseContent:newSection._id,
                                    }
                                },
                                {new:true},
        )
        .populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCouse
        })

    } catch (error) {
        res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}