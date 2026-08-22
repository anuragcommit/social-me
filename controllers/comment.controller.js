import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createComment = asyncHandler(async (req, res) => {

    const postId = req.params.postId;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create(
        {
            content,
            postId,
            userId
        });

    const populatedComment = await comment.populate("UserId", "username email");

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            populatedComment,
            "Comment done successfully"
        )
        );
});


const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comments = await Comment.find({ postId })
        .populate("userId", "username email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});


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


const deleteComment = asyncHandler(async (req, res) => {

    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const post = await Post.findById(comment.postId);
    // if (!post) {
    //     return res.status(404).json({ message: "Cannot find the Post" });
    // }

    const isCommentOwner = comment.userId.toString() === req.user.id.toString();
    const isPostOwner = post && post.userId.toString() === req.user.id.toString();

    if (!isCommentOwner && !isPostOwner) {
        throw new ApiError(403, "You are not authorized to delted this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Comment delted successfully"
        ));
});


const getCommentByPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const comments = await Comment.find({ postId }).populate("userId", "username email");

        return res.status(200).json({ message: "Comments fetched successfully", comments });

    } catch (error) {
        console.error("Unable to fetch comments", error);
        return res.status(500).json({ message: "Error while fetching comments" });
    }
}

export { createComment, updateComment, deleteComment, getCommentByPost, getPostComments }