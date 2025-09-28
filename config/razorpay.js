// const Razorpay = require("razorpay");


// exports.instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY,
//     key_secret: process.env.RAZORPAY_SECRET,
    
// });


const Razorpay = require("razorpay");

// log to check if env vars are being picked up
console.log("Razorpay Key Check:", {
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET ? "Loaded" : "Missing",
});

exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});