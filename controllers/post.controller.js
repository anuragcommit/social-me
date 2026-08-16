import { Post } from "../models/post.model.js";

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
        res.status(200).json(posts)
        console.log("Posts are:", posts)
    } catch (error) {
        res.status(500).json({ error: "failed to fetch posts" });
    }
}



const createPost = async (req, res) => {

    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        const newPost = await Post.create({
            title,
            description,
            user_id: userId,
        });
        console.log("post", req.body);
        res.status(201).json({
            message: "Post created successfully",
            newPost
        })

    } catch (error) {
        console.error("something went wrong when creating post", error);
        res.status(500).json({ error: "Failed to create post" })
    }

}



const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, description } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found!" })
        }


        if (post.user_id.toString() !== req.user.id) {
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


const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found!" });
        }

        if(post.user_id.toString() !== req.user.id){
            return res.status(403).json({message: "Unauthorize: You are not allowed to delete others post!"})
        }

        const deletedPost = await Post.findByIdAndDelete(postId);
        return res.status(200).json({message: "Post deleted successfully"});


    } catch (error) {
        console.error("Unable to delete Post", error);
        res.status(500).json({ message: "Unable to delete Post" });
    }
}



export {
    getPosts,
    createPost,
    updatePost,
    deletePost

};