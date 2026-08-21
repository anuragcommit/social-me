import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const jwtVerify = async (req, res, next) => {
    try {

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized request, token not found" })
        }

        const decodedToken = jwt.verify(token, "ACCESS_TOKEN_SECRET");

        const user = await User.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (decodedToken.tokenVersion !== user.tokenVersion) {
            return res.status(403).json({ message: "Session expired. Please login again" });
        }


        req.user = { id: user._id }
        next();

    } catch (error) {
        console.error("User cannot be verified", error);

        if(error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again"});
        }

        if(error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token"});
        }

        res.status(500).json({ message: "Authentication server error" });
    }

}