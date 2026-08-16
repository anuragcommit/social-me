import { Router } from "express";
import { registerUser, loginUser, deleteUser, updateUserDetails, updateUserPassword } from "../controllers/user.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const router = Router();


router.post('/register', registerUser);
router.post("/login", loginUser);
router.post("/delete-account", jwtVerify, deleteUser);
router.patch("/update-profile", jwtVerify, updateUserDetails);
router.patch("/update-password", jwtVerify, updateUserPassword);


export default router;