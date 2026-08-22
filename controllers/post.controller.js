import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPost = asyncHandler(async (req, res) => {

    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description is required");
    }

    const userId = req.user.id;

    const newPost = await Post.create({
        title,
        description,
        userId,
    });

    console.log("post", req.body);
    return res
        .status(201)
        .json(new ApiResponse(
            201,
            newPost,
            "Post created successfully")
        )
});


const getAllPosts = asyncHandler(async (req, res) => {

    const posts = await Post.find({})
        .populate("userId", "username email")
        .sort({ createdAt: -1});

        console.log("Posts are:", posts)    

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            posts,
            "Posts fetched successfully"
        ));
});


const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("userId", "username email");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post fetched successfully"));
});



const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, description } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found!" })
        }


        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own posts!" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, description },
            { new: true }
        );
        console.log("Post:", updatedPost)

        return res.status(200).json(
            {
                message: "Post updated successfully",
                updatedPost
            });

    } catch (error) {
        console.error("Error while updating the post", error);
        res.status(500).json({ message: "Unable to update post" })
    }
}


const deletePost = asyncHandler(async (req, res) => {

    const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found" );
        }

        if (post.userId.toString() !== req.user.id.toString()) {
            throw new ApiError(403, "Unauthorize: You are not allowed to delete others post" )
        }

        await Comment.deleteMany({ postId });
        await Post.findByIdAndDelete(postId);

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Post and associated comments delted successfully"
        ));
});



export {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getPostById,

};