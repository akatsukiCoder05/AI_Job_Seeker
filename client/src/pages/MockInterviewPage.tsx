import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Loader2,
  FileText,
  Download,
  BookOpen,
} from "lucide-react";
import HaloBackground from "../components/HaloBackground";
import useAi from "../features/useAi";

// Inline SVGs for icons not exported by this lucide-react build
const PlayCircleIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
);
const MailOpenIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
);

export const MockInterviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || undefined;

  const { useGenerateQuestions, useSubmitInterviewAnswers, useGenerateTailoredLatexResume } = useAi();

  const generateQuestionsMutation = useGenerateQuestions();
  const submitAnswersMutation = useSubmitInterviewAnswers();
  const generateTailoredResumeMutation = useGenerateTailoredLatexResume();

  // Page state
  const [step, setStep] = useState<"intro" | "loading_questions" | "question" | "submitting" | "report">("intro");
  const [jobTitle, setJobTitle] = useState<string>("Software Engineer");
  const [company, setCompany] = useState<string>("General Technical");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [evaluationReport, setEvaluationReport] = useState<any>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | undefined>(undefined);

  // Resume tailoring state
  const [tailoredLatex, setTailoredLatex] = useState<string>("");
  const [hasGeneratedTailored, setHasGeneratedTailored] = useState<boolean>(false);

  // Start the assessment: generate questions
  const handleStart = async () => {
    setStep("loading_questions");
    try {
      const res = await generateQuestionsMutation.mutateAsync({ jobId });
      if (res?.success) {
        setQuestions(res.data.questions);
        setJobTitle(res.data.jobTitle);
        setCompany(res.data.company);
        setAnswers(new Array(res.data.questions.length).fill(""));
        setStep("question");
      } else {
        setStep("intro");
        alert("Failed to load interview questions. Please try again.");
      }
    } catch (error) {
      setStep("intro");
      console.error(error);
    }
  };

  // Move to next question
  const handleNext = () => {
    // Save current answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load next answer if previously typed, otherwise clear
      setCurrentAnswer(updatedAnswers[currentQuestionIndex + 1] || "");
    }
  };

  // Move to previous question
  const handleBack = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(updatedAnswers[currentQuestionIndex - 1]);
    }
  };

  // Submit assessment for evaluation
  const handleSubmit = async () => {
    // Save final answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(updatedAnswers);

    // Validate that at least one answer has content
    const hasAnyAnswer = updatedAnswers.some(ans => ans.trim().length > 0);
    if (!hasAnyAnswer) {
      alert("Please provide an answer to at least one question before submitting.");
      return;
    }

    setStep("submitting");
    try {
      const res = await submitAnswersMutation.mutateAsync({
        jobId,
        questions,
        answers: updatedAnswers,
      });

      if (res?.success) {
        setEvaluationReport(res.data.evaluation);
        setEmailPreviewUrl(res.data.emailPreviewUrl);
        setStep("report");
      } else {
        setStep("question");
        alert("Failed to submit answers. Please try again.");
      }
    } catch (error) {
      setStep("question");
      console.error(error);
    }
  };

  // Generate a LaTeX resume tailored specifically to this job
  const handleGenerateTailoredResume = async () => {
    if (!jobId) return;
    try {
      const res = await generateTailoredResumeMutation.mutateAsync({ jobId });
      if (res?.success) {
        setTailoredLatex(res.data.latex);
        setHasGeneratedTailored(true);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate tailored resume.");
    }
  };

  const handleDownloadTex = () => {
    if (!tailoredLatex) return;
    const blob = new Blob([tailoredLatex], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${jobTitle.replace(/\s+/g, "_")}_Tailored_Resume.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color mappings for grade
  const score = evaluationReport?.score || 0;
  const isRecommended = evaluationReport?.recommendation === "apply";

  return (
    <div className="relative min-h-[calc(100vh-80px)] text-ink overflow-hidden flex flex-col justify-center items-center py-6 px-4">
      {/* Vanta.js Halo Background */}
      <HaloBackground />

      <div className="w-full max-w-3xl z-10">
        
        {/* STEP 1: INTRO */}
        {step === "intro" && (
          <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 max-w-xl mx-auto backdrop-blur-md">
            <div className="w-16 h-16 bg-indigo/20 border border-indigo/40 rounded-2xl flex items-center justify-center mx-auto text-indigo">
              <Award size={36} className="animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                AI Technical Test & Mock Interview
              </h1>
              <p className="text-sm text-text-muted">
                Test your readiness for the <span className="text-indigo font-bold">{jobId ? "selected job posting" : "General Technical Role"}</span>.
              </p>
            </div>

            <div className="bg-canvas border border-border rounded-2xl p-5 text-left text-xs text-text-muted space-y-3 leading-relaxed">
              <p className="font-semibold text-ink text-sm">What to expect:</p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo/20 border border-indigo/40 text-indigo flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Receive <strong>4 interview questions</strong> dynamically tailored to the target role's skills and your profile projects.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo/20 border border-indigo/40 text-indigo flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>Write detailed responses outlining your knowledge, experiences, and technical solutions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo/20 border border-indigo/40 text-indigo flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Get evaluated by AI to see an <strong>ATS application recommendation</strong> (Apply vs Do Not Apply), customized weaknesses report, and a <strong>job-tailored LaTeX resume</strong>.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-indigo hover:bg-opacity-90 active:scale-98 transition-all text-sm font-semibold rounded-xl shadow-premium flex items-center justify-center gap-2"
              >
                <PlayCircleIcon size={18} /> Start Assessment
              </button>
              <Link
                to="/preparation"
                className="px-6 py-3 bg-canvas hover:bg-border border border-border active:scale-98 transition-all text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 text-ink"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: LOADING QUESTIONS */}
        {step === "loading_questions" && (
          <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-10 shadow-2xl text-center space-y-6 max-w-sm mx-auto backdrop-blur-md">
            <Loader2 size={40} className="animate-spin text-indigo mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-lg">Generating Questions...</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Analyzing your profile projects, skills, and target job description requirements to craft customized evaluation queries.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: QUESTIONS WIZARD */}
        {step === "question" && (
          <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 backdrop-blur-md">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo bg-indigo/10 border border-indigo/20 px-2.5 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <h3 className="font-bold text-xs text-text-muted mt-2">
                  Target Role: {jobTitle} at {company}
                </h3>
              </div>
              <div className="h-2 w-28 bg-canvas rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="bg-canvas border border-border rounded-2xl p-5 md:p-6 shadow-sm">
              <p className="text-base md:text-lg font-semibold leading-relaxed text-ink">
                {questions[currentQuestionIndex]}
              </p>
            </div>

            {/* Input area */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-muted">Your Response</label>
                <span className="text-[10px] font-medium text-text-muted">
                  {currentAnswer.length} characters (Recommended: 100+)
                </span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your structured, detailed response here. Use relevant technologies, frameworks, and outline your approach or STAR format scenarios..."
                rows={7}
                className="w-full bg-canvas border border-border rounded-2xl p-4 text-sm leading-relaxed text-ink focus:outline-none focus:border-indigo transition-all placeholder:text-text-muted/65"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-5">
              <button
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 bg-canvas border border-border hover:bg-border disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 text-ink"
              >
                <ArrowLeft size={14} /> Back
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-indigo hover:bg-opacity-90 active:scale-95 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  Next Question <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitAnswersMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500/20 active:scale-95 transition-all text-xs font-extrabold rounded-xl flex items-center gap-1.5"
                >
                  {submitAnswersMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                  Submit Evaluation
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SUBMITTING / EVALUATING */}
        {step === "submitting" && (
          <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-10 shadow-2xl text-center space-y-6 max-w-sm mx-auto backdrop-blur-md">
            <Loader2 size={40} className="animate-spin text-indigo mx-auto" />
            <div className="space-y-1.5">
              <p className="font-semibold text-lg">Evaluating Performance...</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Gemini AI is scanning your answers against target competencies, extracting key strengths, identifying weak parts, and rendering a tailored LaTeX resume.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: EVALUATION REPORT */}
        {step === "report" && evaluationReport && (
          <div className="space-y-6">
            
            {/* Top recommendation summary */}
            <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Score Gauge */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Assessment Score</span>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={score >= 70 ? "#10B981" : "#F59E0B"}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (score / 100) * 251.2}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black font-mono text-ink leading-none">{score}</span>
                    <span className="text-[9px] text-text-muted font-semibold mt-0.5">out of 100</span>
                  </div>
                </div>
              </div>

              {/* Recommendation and advice */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ATS Recommendation</span>
                  <div className="flex items-center gap-2">
                    {isRecommended ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase rounded-full">
                        <CheckCircle2 size={14} /> Suggested: Apply Now
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase rounded-full">
                        <AlertTriangle size={14} /> Suggested: Focus on Weaknesses
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-ink leading-relaxed font-medium">
                  {evaluationReport.feedback}
                </p>
              </div>
            </div>

            {/* Email Notification Status */}
            {emailPreviewUrl && (
              <div className="bg-indigo/15 border border-indigo/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-indigo/20 border border-indigo/40 text-indigo flex items-center justify-center shrink-0">
                  <MailOpenIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">Report Emailed Successfully!</p>
                  <p className="text-[10px] text-text-muted mt-0.5 truncate">
                    A test account was created dynamically to host your report.
                  </p>
                </div>
                <a
                  href={emailPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo hover:bg-opacity-90 active:scale-95 transition-all text-[10px] font-bold rounded-lg whitespace-nowrap flex items-center gap-1 shrink-0"
                >
                  Open Inbox <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider border-b border-white/5 pb-2">
                  <CheckCircle2 size={16} /> Key Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluationReport.strengths.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses (Work on weak parts) */}
              <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5 uppercase tracking-wider border-b border-white/5 pb-2">
                  <AlertTriangle size={16} /> Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {evaluationReport.weaknesses.map((weak: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {weak}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Job-tailored Resume (LaTeX) */}
            {jobId && (
              <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText size={16} className="text-indigo" /> Enhanced Job-Tailored LaTeX Resume
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Generate an optimized LaTeX resume tailored for this job description to highlight requirements and missing keyword matches.
                  </p>
                </div>

                {!hasGeneratedTailored ? (
                  <button
                    onClick={handleGenerateTailoredResume}
                    disabled={generateTailoredResumeMutation.isPending}
                    className="px-5 py-2.5 bg-indigo hover:bg-opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    {generateTailoredResumeMutation.isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Generate Tailored Resume
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-canvas border border-border rounded-2xl p-4 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap text-ink">
                      {tailoredLatex}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <form
                        action="https://www.overleaf.com/docs"
                        method="POST"
                        target="_blank"
                        className="inline-block"
                      >
                        <input type="hidden" name="snip" value={tailoredLatex} />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo hover:bg-opacity-90 active:scale-95 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          Open in Overleaf <ExternalLink size={14} />
                        </button>
                      </form>

                      <button
                        onClick={handleDownloadTex}
                        className="px-5 py-2.5 bg-canvas hover:bg-border border border-border active:scale-95 transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5 text-ink"
                      >
                        Download .tex <Download size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer reviews */}
            <div className="glass-card bg-surface/80 dark:bg-surface/45 border border-border rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-wider border-b border-white/5 pb-2">
                Question Transcript & AI Feedback
              </h3>

              <div className="space-y-5">
                {evaluationReport.answers.map((qa: any, i: number) => (
                  <div key={i} className="border-b border-white/5 pb-5 last:border-b-0 last:pb-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo/20 border border-indigo/40 text-indigo flex items-center justify-center text-xs font-black shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-ink leading-relaxed">
                        {qa.question}
                      </p>
                    </div>

                    <div className="bg-canvas border border-border rounded-2xl p-4 space-y-3 ml-9">
                      <div className="space-y-1">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Your Answer:</span>
                        <p className="text-xs text-ink/85 italic leading-relaxed">
                          "{qa.answer || "No response provided."}"
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-border pt-2">
                        <span className="text-[10px] text-indigo font-bold uppercase tracking-wider">AI Evaluation Critique:</span>
                        <p className="text-xs text-ink leading-relaxed">
                          {qa.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center pt-2">
              <Link
                to="/preparation"
                className="px-8 py-3 bg-indigo hover:bg-opacity-90 active:scale-95 transition-all text-sm font-semibold rounded-xl shadow-premium flex items-center gap-1.5"
              >
                <BookOpen size={16} /> Return to Preparation Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewPage;
