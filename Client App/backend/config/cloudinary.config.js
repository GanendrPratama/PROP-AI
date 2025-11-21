require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using CLOUDINARY_URL
// Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

module.exports = cloudinary;
