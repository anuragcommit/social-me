import { Router } from "express";
import { getPosts, createPost,updatePost, deletePost } from "../controllers/post.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";


const router = Router();


router.get('/get-posts', getPosts);
router.post('/create', jwtVerify, createPost);
router.patch('/update/:id', jwtVerify, updatePost);
router.delete('/delete/:id', jwtVerify, deletePost);


export default router;