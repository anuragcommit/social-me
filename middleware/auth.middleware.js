import jwt from "jsonwebtoken";


export const jwtVerify = async (req, res, next) => {
    try {
        console.log("req.body", req.body);

        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message: "Unauthorized request"})
        }

        const decodedToken = jwt.verify(token, "jwt_secret_key_123");

        req.user = { id: decodedToken.id };

        next();

    } catch (error) {
        console.error("User cannot be verified", error)
        res.status(403).json({error: "expired or invalid token"});
    }

}