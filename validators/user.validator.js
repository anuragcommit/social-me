import { z } from "zod";


const registerUserSchema = z.object({
    username: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must not exceed 30 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Invalid email format")
        .toLowerCase(),

    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters long")
        .max(50, "Maximun 50 characters allowed")
});


const loginUserSchema = z.object({
    username: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email format").toLowerCase().optional(),
    password: z.string({ required_error: "Password is required" })
}).refine((data) => data.username || data.email, {
    message: "Either usrename or email is required to login",
    path: ["email"]
});


const updateUserDetailsSchema = z.object({
    username: z.string().trim().min(3, "Username must have at least 3 characters").max(30).optional(),
    email: z.string().trim().email("Invalid email format").toLowerCase().optional()
}).refine((data) => data.username || data.email, {
    message: "At least username or email must be provided for update",
    path: ["username"]
});


const updateUserPasswordSchema = z.object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters long")
});



export {
    registerUserSchema,
    loginUserSchema,
    updateUserPasswordSchema,
    updateUserDetailsSchema
};