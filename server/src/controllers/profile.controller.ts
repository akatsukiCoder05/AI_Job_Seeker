import { Response, NextFunction } from "express";
import { z } from "zod";
import pdfParse from "pdf-parse";
import SeekerProfile from "../models/profile.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { uploadResumeFile } from "../services/upload.service";
import { parseResumeText, getEmbedding } from "../services/ai/groq.service";

// Validation Schema for profile update
export const profileUpdateSchema = z.object({
  education: z.array(
    z.object({
      degree: z.string().nullable().optional().transform((val) => val ?? ""),
      institution: z.string().nullable().optional().transform((val) => val ?? ""),
      year: z.number().min(0).max(new Date().getFullYear() + 5).nullable().optional().transform((val) => val ?? null),
    })
  ).nullable().optional().transform((val) => val ?? []),
  skills: z.array(z.string()).nullable().optional().transform((val) => val ?? []),
  projects: z.array(
    z.object({
      title: z.string().nullable().optional().transform((val) => val ?? ""),
      description: z.string().nullable().optional().transform((val) => val ?? ""),
      tech: z.array(z.string()).nullable().optional().transform((val) => val ?? []),
    })
  ).nullable().optional().transform((val) => val ?? []),
  experience: z.array(
    z.object({
      role: z.string().nullable().optional().transform((val) => val ?? ""),
      org: z.string().nullable().optional().transform((val) => val ?? ""),
      durationMonths: z.number().min(0).nullable().optional().transform((val) => val ?? null),
      summary: z.string().nullable().optional().transform((val) => val ?? ""),
    })
  ).nullable().optional().transform((val) => val ?? []),
  preferences: z.preprocess(
    (val) => val ?? {},
    z.object({
      roles: z.array(z.string()).nullable().optional().transform((val) => val ?? []),
      locations: z.array(z.string()).nullable().optional().transform((val) => val ?? []),
      workMode: z.enum(["remote", "onsite", "hybrid", "any"]).nullable().optional().transform((val) => val ?? "any"),
    })
  ).default({}),
  resumeUrl: z.string().nullable().optional().transform((val) => val ?? ""),
});

// Calculate completeness helper
const calculateCompleteness = (profile: any): number => {
  let score = 0;
  if (profile.education && profile.education.length > 0) score += 15;
  if (profile.skills && profile.skills.length > 0) score += 25;
  if (profile.projects && profile.projects.length > 0) score += 20;
  if (profile.experience && profile.experience.length > 0) score += 20;
  if (profile.preferences && profile.preferences.roles && profile.preferences.roles.length > 0) score += 10;
  if (profile.preferences && profile.preferences.locations && profile.preferences.locations.length > 0) score += 10;
  return score;
};

// Retrieve own profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    
    res.status(200).json({
      success: true,
      data: profile, // could be null if not created yet
    });
  } catch (error) {
    next(error);
  }
};

// Create or update own profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const profileData = req.body;
    
    // Calculate profile completeness
    const completeness = calculateCompleteness(profileData);
    
    // Generate text representation for matching embedding
    const profileText = `
      Skills: ${profileData.skills.join(", ")}
      Experience: ${profileData.experience.map((e: any) => `${e.role} at ${e.org} for ${e.durationMonths} months. ${e.summary}`).join("; ")}
      Projects: ${profileData.projects.map((p: any) => `${p.title}: ${p.description}. Tech: ${p.tech.join(", ")}`).join("; ")}
      Preferences: Roles: ${profileData.preferences.roles.join(", ")}; Locations: ${profileData.preferences.locations.join(", ")}; Work Mode: ${profileData.preferences.workMode}
    `;

    // Compute embedding vector
    const embedding = await getEmbedding(profileText);
    
    // Update or create SeekerProfile
    const profile = await SeekerProfile.findOneAndUpdate(
      { userId },
      {
        ...profileData,
        completeness,
        embedding,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// Parse resume PDF/Text and pre-fill form fields
export const parseResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { message: "No resume file uploaded" },
      });
      return;
    }

    const fileBuffer = req.file.buffer;
    let extractedText = "";

    // 1. Extract text based on file format
    if (req.file.mimetype === "application/pdf") {
      try {
        const parsedPdf = await pdfParse(fileBuffer);
        extractedText = parsedPdf.text;
      } catch (pdfErr) {
        console.error("❌ PDF Parsing Error:", pdfErr);
        res.status(400).json({
          success: false,
          error: { message: "Could not read text from PDF file. Try manual entry." },
        });
        return;
      }
    } else {
      // .tex or .txt file format
      extractedText = fileBuffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      res.status(400).json({
        success: false,
        error: { message: "Resume file contains no text. Please upload a different resume." },
      });
      return;
    }

    // 2. Parse text with Gemini structured parser
    const parsedProfile = await parseResumeText(extractedText);

    // 3. Upload file to storage (Cloudinary or local fallback)
    const resumeUrl = await uploadResumeFile(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save resume text and URL in DB profile for future queries/ATS analysis
    await SeekerProfile.findOneAndUpdate(
      { userId: req.user?._id },
      { resumeUrl, resumeText: extractedText },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        ...parsedProfile,
        resumeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
