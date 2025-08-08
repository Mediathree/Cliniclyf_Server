const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require("dotenv").config();

// Configuring cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setting up storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'uploads', // Cloudinary folder name
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

module.exports = {
    cloudinary,
    storage,
};
