const express = require("express");
const multer = require("multer");

const { createProduct, getProducts, updateProduct, deleteProduct, getProductById } = require("../controllers/productController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');

const upload = multer({ storage });

const router = express.Router();

// Create a new clinic
// router.post("/create", validate("body", createClinic.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.DOCTOR_ID]), createClinic.handler);

router.post("/create", authMiddleware, (req, res, next) => {
    upload.single('photo')(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err || 'Upload error',
            });
        }
        next();
    });
}, validate("body", createProduct.validation), createProduct.handler);

router.get("/get", getProducts.handler);

router.get("/get/:id", getProductById.handler);

router.put("/update/:id", authMiddleware, upload.single('photo'), validate("body", updateProduct.validation), updateProduct.handler);

router.delete("/delete/:id", authMiddleware, deleteProduct.handler);

module.exports = router;