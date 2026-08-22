import { Router } from "express";
import { registerUser, loginUser, deleteUser, updateUserDetails, updateUserPassword, logoutUser, logoutFromAllDevice } from "../controllers/user.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerUserSchema, loginUserSchema, updateUserDetailsSchema, updateUserPasswordSchema } from "../validators/user.validator.js";

const router = Router();


router.route('/register').post(validate(registerUserSchema), registerUser);
router.route("/login").post(validate(loginUserSchema), loginUser);

router.route("/update-profile").patch(jwtVerify, validate(updateUserDetailsSchema), updateUserDetails);
router.route("/update-password").patch(jwtVerify, validate(updateUserPasswordSchema), updateUserPassword);

router.post("/delete-account", jwtVerify, deleteUser);
router.post("/logout", jwtVerify, logoutUser);
router.post("/logout-all", jwtVerify, logoutFromAllDevice);




export default router;