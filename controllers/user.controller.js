import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

   //not required due to zod validation
    // if ([username, email, password].some((field) => !field || field.trim() === "")) {
    //     throw new ApiError(400, "All fields are required");
    // }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {

        if (existingUser.username === username) {
            throw new ApiError(409, "Username already exists");
        }

        if (existingUser.email === email) {
            throw new ApiError(409, "Email already exists");
        }
    }

    const saltRound = 12;
    const hashedPassword = await bcrypt.hash(password, saltRound)

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    console.log("User registered success", user._id);

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            createdUser,
            "User registered successfully")
        )

});


const loginUser = asyncHandler(async (req, res) => {

    const { email, password, username } = req.body;

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incorrect")
    }

    const token = jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    const loggedInUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("token", token, options)
        .json(new ApiResponse(
            200,
            loggedInUser,
            "User logged in Successfully")
        )
});



const logoutUser = asyncHandler(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("token", options)
        .json(new ApiResponse(
            200,
            null,
            "User logged out successfully")
        )
});


const deleteUser = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await Post.deleteMany({ userId }); // delte all post

    await User.findByIdAndDelete(userId); // delete user

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    }

    return res
        .status(200)
        .clearCookie("token", options)
        .json(new ApiResponse(
            200,
            null,
            "Account and it's posts are deleted successfully.")
        )
});




const updateUserDetails = asyncHandler(async (req, res) => {

    const { username, email } = req.body;
    const userId = req.user.id;

    // removed due to zod validation
    // if (!username && !email) {
    //     throw new ApiError(400, "Username or email is required")
    // }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            ...(username && { username }),
            ...(email && { email })
        },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found!");
    }

    console.log("updated user details:", updatedUser);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser,
            "User details updated successfully")
        )
});


const updateUserPassword = asyncHandler(async (req, res) => {

    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // if (!oldPassword || !newPassword) {
    //     throw new ApiError(400, "Please enter your old and new passwords.")
    // }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.tokenVersion += 1;

    await user.save();

    // const updatedPassword = await User.findByIdAndUpdate(
    //     userId,
    //     { password: hashedPassword },
    //     { new: true }
    // );
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Password updated successfully")
        )
});




const logoutFromAllDevice = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.tokenVersion += 1;
    await user.save();

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    }
    return res
        .status(200)
        .clearCookie("token", options)
        .json(new ApiResponse(
            200,
            null,
            "Logged out of all devices successfully")
        )
})


export { registerUser, loginUser, deleteUser, updateUserDetails, updateUserPassword, logoutUser, logoutFromAllDevice }