import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";


const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await Comment.create(
            {
                content,
                postId,
                userId
            });

        return res.status(201).json({
            message: "Commented on Post successfully",
            comment
        });


    } catch (error) {
        console.error("Cannot make comment", error);
        res.status(500).json({ message: "Unable to make comment" });
    }
}


const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this comment" });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );

        console.log("updated comment", updatedComment);

        return res.status(200).json({
            message: "comment updated successfully",
            updatedComment
        });

    } catch (error) {
        console.error("Unable to update comment", error);
        return res.status(500).json({ message: "Error while updating comment, try again." });
    }
}


const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);
        if(!comment){
            return res.status(404).json({message: "Comment not found"});
        }

        const post = await Post.findById(comment.postId);
        if(!post){
            return res.status(404).json({message: "Cannot find the Post"});
        }


        if(comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id){
            return res.status(403).json({message: "You are not authorized to delete this comment"});
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId);
        return res.status(200).json({message: "Comment deleted successfully"});

    } catch (error) {
        console.error("Unable to delete comment", error);
        return res.status(500).json({message: "Error while deleteing comment, try again."});
    }
}


const getCommentByPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const comments = await Comment.find({postId}).populate("userId", "username email");
        
        return res.status(200).json({message: "Comments fetched successfully", comments});

    } catch (error) {
        console.error("Unable to fetch comments", error);
        return res.status(500).json({message: "Error while fetching comments"});
    }
}

export { createComment, updateComment, deleteComment, getCommentByPost }