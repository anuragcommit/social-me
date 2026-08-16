import { Router } from "express";
import { createComment, updateComment, deleteComment, getCommentByPost } from "../controllers/comment.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";


const router = Router();

router.post('/create-comment/:postId', jwtVerify, createComment);
router.patch('/update-comment/:commentId', jwtVerify, updateComment);
router.delete('/delete-comment/:commentId', jwtVerify, deleteComment);
router.get('/get-comment/:postId', jwtVerify, getCommentByPost);



export default router;