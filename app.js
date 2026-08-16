import express from "express";
import mongoose from "mongoose";


const app = express();
const port = 3000;

app.use(express.json());

import postRouter from "./routes/post.route.js";
app.use('/api/posts', postRouter);


import loginRouter from "./routes/user.route.js";
app.use('/api/users', loginRouter);


import commentRouter from "./routes/comment.route.js";
app.use('/api/comments', commentRouter);


(async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/NewDB")
        console.log("Database connected successfully")
    } catch (error) {
         console.error("MongoDB connection failed", error);
         process.exit(1);  
    }
})();




app.listen(port, () => {
    console.log("Server is running on port:", port)
})


export {app}