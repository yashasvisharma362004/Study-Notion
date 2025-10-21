const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// -------------------- CREATE COURSE --------------------
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    const thumbnail = req.files?.thumbnail;

    // Parse arrays from strings
    const tag = _tag ? JSON.parse(_tag) : [];
    const instructions = _instructions ? JSON.parse(_instructions) : [];

    // Validate input
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !category ||
      !thumbnail ||
      !instructions.length
    ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!status) status = "Draft";

    // Validate instructor
    const instructorDetails = await User.findOne({ _id: userId, accountType: "Instructor" });
    if (!instructorDetails) {
      return res.status(400).json({ success: false, message: "User is not an instructor" });
    }

    // Validate category
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    // Upload thumbnail
    const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

    // Create course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions,
    });

    // Add course to instructor
    await User.findByIdAndUpdate(userId, { $push: { courses: newCourse._id } });

    // Add course to category
    await Category.findByIdAndUpdate(category, { $push: { courses: newCourse._id } });

    res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create course", error: error.message });
  }
};

// -------------------- EDIT COURSE --------------------
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = { ...req.body };

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Update thumbnail if present
    if (req.files?.thumbnail) {
      const thumbnailImage = await uploadImageToCloudinary(req.files.thumbnail, process.env.FOLDER_NAME);
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update fields
    for (const key in updates) {
      if (key === "tag" || key === "instructions") {
        course[key] = JSON.parse(updates[key]);
      } else if (key !== "courseId") {
        course[key] = updates[key];
      }
    }

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    res.json({ success: true, message: "Course updated successfully", data: updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// -------------------- GET ALL COURSES --------------------
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "Published" })
      .select("courseName price thumbnail instructor ratingAndReviews studentsEnrolled")
      .populate("instructor");
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch courses", error: error.message });
  }
};

// -------------------- GET COURSE DETAILS --------------------
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection", select: "-videoUrl" },
      });

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    let totalDurationInSeconds = 0;
    course.courseContent.forEach((section) => {
      section.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    res.status(200).json({ success: true, data: { courseDetails: course, totalDuration } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET FULL COURSE DETAILS --------------------
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const progress = await CourseProgress.findOne({ courseID: courseId, userId });

    let totalDurationInSeconds = 0;
    course.courseContent.forEach((section) => {
      section.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration || 0);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    res.status(200).json({
      success: true,
      data: {
        courseDetails: course,
        totalDuration,
        completedVideos: progress?.completedVideos || [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET INSTRUCTOR COURSES --------------------
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const courses = await Course.find({ instructor: instructorId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- DELETE COURSE --------------------
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Unenroll students
    for (const studentId of course.studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, { $pull: { courses: courseId } });
    }

    // Delete sections & subsections
    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId);
      if (section) {
        await SubSection.deleteMany({ _id: { $in: section.subSection } });
      }
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- HELPER FUNCTION --------------------
function convertSecondsToDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
