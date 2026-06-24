import { Schema, model, Document, Types } from "mongoose";

export interface IEvaluationAnswer {
  question: string;
  answer: string;
  feedback: string;
}

export interface IEvaluation extends Document {
  seekerId: Types.ObjectId;
  jobId?: Types.ObjectId;
  jobTitle: string;
  company?: string;
  score: number;
  recommendation: "apply" | "do_not_apply";
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  answers: IEvaluationAnswer[];
  createdAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: false,
    },
    score: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
      enum: ["apply", "do_not_apply"],
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        feedback: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Evaluation = model<IEvaluation>("Evaluation", evaluationSchema);
export default Evaluation;
