import jwt from "jsonwebtoken";


export const jwtVerify = async (req, res, next) => {
    try {
        console.log("req.body", req.body);

        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({message: "Unauthorized access"})
        }

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token, "jwt_secret_key_123");

        req.user = decodedToken;

        next();
    } catch (error) {
        console.error("User cannot be verified", error)
        res.status(401).json({error: "expired or invalid token"})
    }

}