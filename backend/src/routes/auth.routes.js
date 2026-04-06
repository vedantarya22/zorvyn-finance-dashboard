import { Router } from "express";
import {register,login,getMe} from "../controllers/auth.Controller.js";
import verifyToken from "../middleware/auth.js";

const router = Router();

router.post("/register",register);
router.post("/login",login);
router.get("/me",verifyToken,getMe); // protected route

export default router;

