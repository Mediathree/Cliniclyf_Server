const express = require("express");

const { createRole, getRoles, getRoleById, updateRole, deleteRole } = require("../controllers/rolesController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

router.post("/create", validate("body", createRole.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), createRole.handler);
router.get("/", authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), getRoles.handler);
router.get("/:id", validate("params", getRoleById.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), getRoleById.handler);
router.put("/update", validate("body", updateRole.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), updateRole.handler);
router.delete("/delete/:id", validate("params", deleteRole.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteRole.handler);



module.exports = router;
