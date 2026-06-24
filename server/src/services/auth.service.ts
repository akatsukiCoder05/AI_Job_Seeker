import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import env from "../config/env";
import User, { IUser } from "../models/user.model";
import SeekerProfile from "../models/profile.model";
import Job from "../models/job.model";
import Application from "../models/application.model";
import SavedJob from "../models/savedJob.model";
import Notification from "../models/notification.model";

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

export const registerUser = async (data: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "seeker" | "recruiter";
}): Promise<{ token: string; user: Omit<IUser, "passwordHash"> }> => {
  const emailLower = data.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Create directly verified user
  const user = await User.create({
    name: data.name,
    email: emailLower,
    phone: data.phone,
    passwordHash: data.passwordHash,
    role: data.role,
    verified: true,
  });

  const token = generateToken(user);
  
  // Return user without password
  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};

export const loginUser = async (email: string, passwordHash: string): Promise<{ token: string; user: Omit<IUser, "passwordHash"> }> => {
  const emailLower = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailLower });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};

/**
 * Wipes a user's account and all associated documents from the database
 */
export const deleteUserAccount = async (userId: Types.ObjectId | string): Promise<void> => {
  const id = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  // 1. Delete user profile
  await SeekerProfile.findOneAndDelete({ userId: id });

  // 2. Delete job postings created by this recruiter
  await Job.deleteMany({ recruiterId: id });

  // 3. Delete applications sent by this seeker, and also applications received for their posted jobs (if recruiter)
  const jobs = await Job.find({ recruiterId: id }).select("_id");
  const jobIds = jobs.map((j) => j._id);
  await Application.deleteMany({
    $or: [
      { seekerId: id },
      { jobId: { $in: jobIds } }
    ]
  });

  // 4. Delete saved jobs
  await SavedJob.deleteMany({ seekerId: id });

  // 5. Delete notifications for this user
  await Notification.deleteMany({ userId: id });

  // 6. Delete user document
  await User.findByIdAndDelete(id);
};

