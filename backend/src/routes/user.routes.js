import { Router } from "express";

import { getAllUsers,getUserById,updateUserRole,updateUserStatus } from "../controllers/user.controller.js";

import verifyToken from "../middleware/auth.js";
import requireRole from "../middleware/rbac.js";

const router = Router();

//all user routes will be admin only
router.use(verifyToken ,requireRole("admin"));

router.get("/",getAllUsers);
router.get("/:id",getUserById);
router.patch("/:id/role",updateUserRole);
router.patch("/:id/status",updateUserStatus);

export default router;