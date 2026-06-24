import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import User from "../models/user.model";

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["seeker", "recruiter"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await authService.registerUser({
      name,
      email,
      phone,
      passwordHash,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        message: "Registration successful",
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      data: {
        message: "Login successful",
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation schema for phone update
export const updatePhoneSchema = z.object({
  phone: z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number is too long"),
});

// Update own phone number (authenticated)
export const updatePhone = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = req.body;
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { phone } },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Phone number updated successfully. You will now receive SMS notifications on this number.",
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete own account (authenticated)
export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: "Not authorized" },
      });
      return;
    }

    await authService.deleteUserAccount(userId);

    res.status(200).json({
      success: true,
      data: {
        message: "Your account and all associated data have been permanently deleted.",
      },
    });
  } catch (error) {
    next(error);
  }
};

