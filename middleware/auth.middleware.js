import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const jwtVerify = async (req, res, next) => {
    try {
        console.log("req.body", req.body);

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized request, token not found" })
        }

        const decodedToken = jwt.verify(token, "jwt_secret_key_123");

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (decodedToken.tokenVersion !== user.tokenVersion) {
            return res.status(403).json({ message: "Session expired due to logout from another device. Please login again" });
        }


        req.user = { id: user._id }
        next();

    } catch (error) {
        console.error("User cannot be verified", error)
        res.status(403).json({ error: "expired or invalid token" });
    }

}