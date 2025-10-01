const Section = require("../models/Section");
const subSection = require("../models/SubSection");
const { $where } = require("../models/tags");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create a new SubSection for a given section
exports.createSubSection = async(req,res)=>{
    try {
        // Extract necessary information from the request body
        const {sectionId,title,description} = req.body;
        const video = req.files.video
        //validation
        if(!sectionId || !title || !description || !video){
            return res.status(404).json({
                success:false,
                message:"All fields are required",
            })
        }
        console.log(video);
        //upload the file to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        console.log(uploadDetails);

        // Create a new sub-section with  necessary information
        const SubSectionDetails = await subSection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,/////changes in this line
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        //update the section with newly created subsection
        const updatedSection = await Section.findByIdAndUpdate(
            {id:sectionId},
            { $push: { subSection: SubSectionDetails._id } },
             { new: true }
             ).populate("subSection")
             //return the updated section in the response
             return res.status(200).json({ success: true, data: updatedSection })

    } catch (error) {
        console.error("error creating new sub-section",error);
        return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
    }
}


exports.updatedSubSection = async (req,res)=>{
    try {
        const{sectionId,subSectionId,title,description} = req.body;
        const subSection = await SubSection.findById(subSectionId);
        if(!subSection){
            return res.status(404).json({
                success:false,
                message:"SubSection not found",
            })
        }
        if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"An error occured while updating the section",
        })
    }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}