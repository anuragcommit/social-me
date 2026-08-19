import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { Post } from "../models/post.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const saltRound = 12;
        const hashedPassword = await bcrypt.hash(password, saltRound)

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({ message: "User registration successfull" });
        console.log("User registered success", req.body)
    } catch (error) {
        console.error("Something went wrong while registering User", error);
        return res.status(500).json({ message: "Error registering User" });
    }
}


const loginUser = async (req, res) => {
    try {

        console.log("user data:", req.body);

        const { email, password, username } = req.body;
        const user = await User.findOne({ email, username });

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Password is incorrect" })
        }

        const token = jwt.sign(
            { id: user.id, tokenVersion: user.tokenVersion },
            "jwt_secret_key_123",
            { expiresIn: "1d" }
        );

        const options ={
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        }

        return res.status(200)
        .cookie("token", token, options)
        .json({
            token,
            message: "Login successfull",
            user: {id: user._id, username: user.username, email: user.email, tokenVersion: user.tokenVersion}
        });

    } catch (error) {
        console.error("Login failed", error)
        res.status(500).json({ message: "Error logging in" })
    }
}


const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        await Post.deleteMany({ user_id: userId });

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json({ message: "Account and it's posts are deleted successfully." });


    } catch (error) {
        console.error("Unable to delete User", error);
        res.status(500).json({ message: "Unable to delete accout" });
    }
}


const updateUserDetails = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        console.log("updated user details:", updatedUser);

        return res.status(200).json({ message: "User detail updated successfully", updatedUser });

    } catch (error) {
        console.error("Cannot update user data:", error);
        res.status(500).json({ message: "unable to update user details" });
    }
}


const updateUserPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({message: "Please enter your old and new passwords."})
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Incorrect old password"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedPassword = await User.findByIdAndUpdate(
           userId,
           {password: hashedPassword},
           {new: true}
        );
        return res.status(200).json({message: "Password updated successfully"});
        console.log("password updated:", updatedPassword);

    } catch (error) {
        console.error("Unable to update password", error);
        return res.status(500).json({message: "Error while updating password"});
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
         .json({message: "User logged out successfully"});
         
    } catch (error) {
        console.error("Unable to logout user", error);
        res.status(500).json({message: "Error while logging out user"});
    }
}


const logoutFromAllDevice = async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
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
        .json({message: "Logged out of all devices successfully"});

    } catch (error) {
        console.error("Unable to logout from all devices", error);
        res.status(500).json({message: "Error while logging out from all devices"});
    }
}


export { registerUser, loginUser, deleteUser, updateUserDetails, updateUserPassword, logoutUser, logoutFromAllDevice }