require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./services/user-services/routes/authRoutes");
const userAddressRoutes = require("./services/user-services/routes/userAddressRoutes");
const clinicRoutes = require("./services/user-services/routes/clinicRoutes");
const appointmentRoutes = require("./services/user-services/routes/appointmentRoutes");
const doctorRoutes = require("./services/user-services/routes/doctorRoutes");
const planRoutes = require("./services/user-services/routes/planRoutes");
const orderRoutes = require("./services/user-services/routes/orderRoutes");
const subscriptionRoutes = require("./services/user-services/routes/subscriptionRoutes");
const ratingRoutes = require("./services/user-services/routes/ratingRoutes");
const dashboardRoutes = require("./services/admin-services/routes/dashboard");
const productRoutes = require("./services/user-services/routes/productRoutes");
const categoryRoutes = require("./services/user-services/routes/categoryRoutes");
const subCategoryRoutes = require("./services/user-services/routes/subCategoryRoutes");
const subSubCategoryRoutes = require("./services/user-services/routes/subSubCategoryRoutes");
const settingsRoutes = require("./services/user-services/routes/settingsRoutes");
const permissionRoutes = require("./services/user-services/routes/permissionRoutes");
const groupRoutes = require("./services/user-services/routes/groupRoutes");
const user_group_Routes = require("./services/user-services/routes/user_group_Routes");
const user_permission_Routes = require("./services/user-services/routes/user_permission_Routes");
const group_permission_Routes = require("./services/user-services/routes/group_permission_Routes");
const permissionCategoryRoutes = require("./services/user-services/routes/permissionCategoryRoutes");

const startAndSyncDB = require("./models");

const app = express();

startAndSyncDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ['http://localhost:3000']
}));
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/address", userAddressRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/subSubCategory", subSubCategoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/permissionCategory", permissionCategoryRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/user_group", user_group_Routes);
app.use("/api/user_permission", user_permission_Routes);
app.use("/api/group_permission", group_permission_Routes);


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
