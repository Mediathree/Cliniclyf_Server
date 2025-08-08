const express = require("express");
const multer = require("multer");

const { authController, userController } = require("../controllers/authController");
const validate = require("../../../middleware/validateMiddleware"); // Request validation middleware
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');

const upload = multer({ storage });

const router = express.Router();

router.post("/register", validate("body", authController.register.validation), authController.register.handler);

router.post("/login", validate("body", authController.login.validation), authController.login.handler);

router.get("/get", authMiddleware, userController.getUsers.handler);

router.get("/get-settings", authMiddleware, userController.getSetting.handler);

// Forgot password endpoint
router.post("/forgot-password", validate("body", authController.forgotPassword.validation), authController.forgotPassword.handler);


// OTP verification endpoint
router.post("/verify-otp", validate("body", authController.verifyOtp.validation), authController.verifyOtp.handler);

// Change password endpoint
router.post("/change-password", validate("body", authController.changePassword.validation), authController.changePassword.handler);

router.put("/update", authMiddleware, validate("body", userController.updateUser.validation), userController.updateUser.handler);

router.patch("/update-settings", upload.single('site_logo'), authMiddleware, validate("body", userController.updateSetting.validation), userController.updateSetting.handler);

router.delete("/delete/:id", authMiddleware, validate("params", userController.deleteUser.validation), userController.deleteUser.handler);

module.exports = router;
