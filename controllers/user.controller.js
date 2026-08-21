import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { Post } from "../models/post.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!(username || email || password)) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {

            if (existingUser.usernsme === username) {
                return res.status(409).json({ message: "Username already exists" });
            }

            if (existingUser.email === email) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        const saltRound = 12;
        const hashedPassword = await bcrypt.hash(password, saltRound)

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        console.log("User registered success", user._id);

        return res.status(201).json({ message: "User registration successfull" });

    } catch (error) {
        console.error("Something went wrong while registering User", error);

        //MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        return res.status(500).json({ message: "Error registering User" });
    }
}


const loginUser = async (req, res) => {
    try {

        console.log("user data:", req.body);

        const { email, password, username } = req.body;

        const user = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Password is incorrect" })
        }

        const token = jwt.sign(
            { id: user.id, tokenVersion: user.tokenVersion },
            "process.env.ACCESS_TOKEN_SECRET",
            { expiresIn: "ACCESS_TOKEN_EXPIRY" }
        );

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        }

        return res
            .status(200)
            .cookie("token", token, options)
            .json({
                token,
                message: "Login successfull",
                user: { id: user._id, username: user.username, email: user.email, tokenVersion: user.tokenVersion }
            });

    } catch (error) {
        console.error("Login failed", error)
        return res.status(500).json({ message: "Error logging in" })
    }
}


const logoutUser = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        }

        return res
            .status(200)
            .clearCookie("token", options)
            .json({ message: "User logged out successfully" });

    } catch (error) {
        console.error("Unable to logout user", error);
        res.status(500).json({ message: "Error while logging out user" });
    }
}


const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Post.deleteMany({ userId: userId }); // delte all post

        await User.findByIdAndDelete(userId); // delete user

        const oprions = {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        }

        return res
            .status(200)
            .clearCookie("token", options)
            .json({ message: "Account and it's posts are deleted successfully." });


    } catch (error) {
        console.error("Unable to delete User", error);

        return res.status(500).json({ message: "Unable to delete accout" });
    }
}


const updateUserDetails = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        if (!(username && email)) {
            return res.status(400).json({ message: "Username or email is required" })
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(username && { username }),
                ...(email && { email })
            },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        console.log("updated user details:", updatedUser);

        return res.status(200).json({ message: "User detail updated successfully", updatedUser });

    } catch (error) {
        console.error("Cannot update user data:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];

            return res.status(409).json({ message: `${duplicateField} already exists` });
        }

        return res.status(500).json({ message: "unable to update user details" });
    }
}


const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Please enter your old and new passwords." })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Incorrect old password" });
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
        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Unable to update password", error);
        return res.status(500).json({ message: "Error while updating password" });
    }
}




const logoutFromAllDevice = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
            .json({ message: "Logged out of all devices successfully" });

    } catch (error) {
        console.error("Unable to logout from all devices", error);
        res.status(500).json({ message: "Error while logging out from all devices" });
    }
}


export { registerUser, loginUser, deleteUser, updateUserDetails, updateUserPassword, logoutUser, logoutFromAllDevice }