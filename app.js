import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import loginRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";

import { errorHandler } from './middleware/error.middleware.js';



const app = express();
const port = process.env.PORT || 8000;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use('/api/posts', postRouter);
app.use('/api/users', loginRouter);
app.use('/api/comments', commentRouter);


app.use(errorHandler);


(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected successfully")

        app.listen(port, () => {
            console.log("Server is running on port:", port)
        })


    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
})();






export { app }