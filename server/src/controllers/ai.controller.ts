import { Response, NextFunction } from "express";
import { z } from "zod";
import SeekerProfile from "../models/profile.model";
import Job from "../models/job.model";
import User from "../models/user.model";
import Application from "../models/application.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as groqService from "../services/ai/groq.service";

export const skillGapSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid jobId format"),
});

export const coverLetterSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid jobId format"),
});

export const getAtsScore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first before analyzing your resume." },
      });
      return;
    }

    const result = await groqService.getAtsScore(profile, req.user?.email || "");
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job not found" },
      });
      return;
    }

    const result = await groqService.getSkillGapAnalysis(profile, job);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job not found" },
      });
      return;
    }

    const coverLetter = await groqService.generateCoverLetter(
      profile,
      job,
      req.user?.name || "Job Seeker"
    );

    res.status(200).json({
      success: true,
      data: { coverLetter },
    });
  } catch (error) {
    next(error);
  }
};

export const generateLatexResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const latex = groqService.generateLatexResume(
      profile,
      req.user?.email || "",
      req.user?.name || "Job Seeker"
    );

    res.status(200).json({
      success: true,
      data: { latex },
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithAi = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, history } = req.body;
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    const reply = await groqService.chatWithAi(message, history || [], profile, req.user?.name || "Job Seeker");
    
    res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
};

export const generateSeekerLatexResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { seekerId } = req.body;
    if (!seekerId) {
      res.status(400).json({
        success: false,
        error: { message: "seekerId is required." },
      });
      return;
    }

    const seekerUser = await User.findById(seekerId);
    if (!seekerUser) {
      res.status(404).json({
        success: false,
        error: { message: "Seeker not found." },
      });
      return;
    }

    const profile = await SeekerProfile.findOne({ userId: seekerId });
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { message: "Seeker profile not found." },
      });
      return;
    }

    // Verify recruiter has a job that this seeker applied to
    const recruiterId = req.user?._id;
    const applications = await Application.find({ seekerId }).populate("jobId");
    const isApplied = applications.some((app: any) => app.jobId?.recruiterId?.toString() === recruiterId?.toString());

    if (!isApplied) {
      res.status(403).json({
        success: false,
        error: { message: "You are not authorized to view this candidate's LaTeX resume." },
      });
      return;
    }

    const latex = groqService.generateLatexResume(
      profile,
      seekerUser.email || "",
      seekerUser.name || "Job Seeker"
    );

    res.status(200).json({
      success: true,
      data: { latex },
    });
  } catch (error) {
    next(error);
  }
};
