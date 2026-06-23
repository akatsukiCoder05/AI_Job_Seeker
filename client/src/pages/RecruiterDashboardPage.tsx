import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Plus, Download, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import useAuthStore from "../store/auth.store";
import useJobs, { Job } from "../features/useJobs";
import useApplications, { ApplicantDetail } from "../features/useApplications";
import MatchRing from "../components/match-ring/MatchRing";
import api from "../lib/axios";

export const RecruiterDashboardPage = () => {
  const { user } = useAuthStore();
  
  // Selected Job for applicant tracking
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  // Selected Candidate for profile audit
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDetail | null>(null);

  // LaTeX state for candidates
  const [latexCode, setLatexCode] = useState<string>("");
  const [loadingLatex, setLoadingLatex] = useState<boolean>(false);

  const handleSelectApplicant = (app: ApplicantDetail | null) => {
    setSelectedApplicant(app);
    setLatexCode("");
  };

  const getResumeUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    return `${baseUrl}${url}`;
  };

  const fetchLatexResume = async () => {
    if (!selectedApplicant?.seeker?._id) return;
    setLoadingLatex(true);
    try {
      const res = await api.post("/ai/recruiter/latex-resume", {
        seekerId: selectedApplicant.seeker._id,
      });
      if (res.data?.success) {
        setLatexCode(res.data.data.latex);
      } else {
        alert("Failed to compile LaTeX resume");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error?.message || "Failed to compile LaTeX resume");
    } finally {
      setLoadingLatex(false);
    }
  };

  // 1. Fetch all jobs
  const { useGetJobs } = useJobs({ limit: 100 });
  const { data: jobsData, isLoading: isLoadingJobs, refetch: refetchJobs } = useGetJobs();
  
  // Filter jobs posted by this recruiter
  const recruiterJobs = (jobsData?.data?.jobs || []).filter(
    (job) => job.recruiterId === user?._id
  );

  // 2. Fetch applicants and stats
  const { useGetJobApplicants, useUpdateApplicationStatus, useGetRecruiterStats } = useApplications();
  const { 
    data: applicantsData, 
    isLoading: isLoadingApplicants,
    refetch: refetchApplicants 
  } = useGetJobApplicants(selectedJob?._id || "");

  const { data: statsData, isLoading: isLoadingStats } = useGetRecruiterStats();

  const applicants = applicantsData?.data || [];

  // 3. Status update mutation
  const updateStatusMutation = useUpdateApplicationStatus(selectedJob?._id || "");

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: appId,
        status: newStatus
      });
      // Update locally selected applicant status if it was open
      if (selectedApplicant && selectedApplicant.application._id === appId) {
        setSelectedApplicant(prev => prev ? {
          ...prev,
          application: {
            ...prev.application,
            status: newStatus as any
          }
        } : null);
      }
      refetchApplicants();
    } catch (err) {
      alert("Failed to update applicant status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-indigo-tint text-indigo border-indigo/10";
      case "review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-canvas text-text-muted";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink">Recruiter Workspace</h1>
          <p className="text-text-muted mt-1">Review candidates and manage your posted openings.</p>
        </div>
        <Link
          to="/recruiter/jobs"
          className="px-5 py-2.5 bg-indigo text-white text-sm font-semibold rounded-button hover:bg-opacity-95 flex items-center gap-2"
        >
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-card border border-border shadow-card">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Active Openings</span>
            <Briefcase size={20} className="text-indigo" />
          </div>
          <div className="mt-2 text-4xl font-mono font-bold text-ink">{recruiterJobs.length}</div>
        </div>
        <div className="p-6 bg-white rounded-card border border-border shadow-card">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Candidate Submissions</span>
            <Users size={20} className="text-emerald" />
          </div>
          <div className="mt-2 text-4xl font-mono font-bold text-ink">
            {isLoadingStats ? "..." : (statsData?.data?.totalApplicants ?? 0)}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Jobs list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-display font-semibold text-ink">My Job Postings</h2>
            <button 
              onClick={() => { refetchJobs(); if (selectedJob) refetchApplicants(); }}
              className="text-text-muted hover:text-indigo p-1"
              title="Refresh Listings"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {isLoadingJobs ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white border border-border rounded-card animate-pulse" />
              ))}
            </div>
          ) : recruiterJobs.length === 0 ? (
            <div className="p-8 bg-white border border-border rounded-card text-center space-y-3">
              <Briefcase className="mx-auto text-text-muted" size={30} />
              <p className="text-sm text-text-muted">You haven't posted any jobs yet.</p>
              <Link to="/recruiter/jobs" className="text-indigo text-xs font-semibold hover:underline">
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recruiterJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => {
                    setSelectedJob(job);
                    handleSelectApplicant(null);
                  }}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    selectedJob?._id === job._id
                      ? "bg-indigo-tint/30 border-indigo"
                      : "bg-white border-border hover:border-indigo/40"
                  }`}
                >
                  <h3 className="font-bold text-sm text-ink line-clamp-1">{job.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                    <span>{job.location} ({job.workMode})</span>
                    <span>{job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Applicants list for selected job */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-display font-semibold text-ink">
            {selectedJob ? `Applicants for ${selectedJob.title}` : "Select a job to view applicants"}
          </h2>

          {!selectedJob ? (
            <div className="p-16 bg-white border border-border rounded-card text-center text-text-muted text-sm">
              Please select one of your active job postings on the left to review candidate profiles and download resumes.
            </div>
          ) : isLoadingApplicants ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-white border border-border rounded-card animate-pulse" />
              ))}
            </div>
          ) : applicants.length === 0 ? (
            <div className="p-16 bg-white border border-border rounded-card text-center text-text-muted text-sm space-y-2">
              <Users size={32} className="mx-auto" />
              <p>No candidates have applied to this job yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Applicant Rows */}
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div
                    key={app.application._id}
                    onClick={() => handleSelectApplicant(app)}
                    className={`p-4 bg-white border rounded-card hover:border-indigo/40 hover:shadow-card transition-all flex justify-between items-center gap-4 cursor-pointer ${
                      selectedApplicant?.application._id === app.application._id
                        ? "border-indigo shadow-card"
                        : "border-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-ink">{app.seeker.name}</h4>
                      <p className="text-xs text-text-muted">{app.seeker.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(app.application.status)}`}>
                        {app.application.status}
                      </span>
                      <MatchRing score={app.application.matchScore} size="small" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Details Drawer / Modal overlay */}
      {selectedApplicant && selectedJob && (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-end p-4">
          <div className="w-full max-w-xl bg-white h-full rounded-l-[24px] shadow-2xl p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-display text-ink leading-tight">{selectedApplicant.seeker.name}</h2>
                  <p className="text-sm text-indigo font-semibold">{selectedApplicant.seeker.email} • {selectedApplicant.seeker.phone}</p>
                </div>
                <button
                  onClick={() => handleSelectApplicant(null)}
                  className="text-text-muted hover:bg-canvas p-1.5 rounded-full shrink-0"
                  title="Close"
                >
                  <XIcon size={20} />
                </button>
              </div>

              {/* Status Action Selector */}
              <div className="p-4 bg-canvas border border-border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Application Status</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize mt-1 inline-block ${getStatusColor(selectedApplicant.application.status)}`}>
                    {selectedApplicant.application.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">Update Status</label>
                  <select
                    value={selectedApplicant.application.status}
                    onChange={(e) => handleStatusChange(selectedApplicant.application._id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-border rounded-button text-xs font-medium text-ink focus:outline-none"
                  >
                    <option value="applied">Applied</option>
                    <option value="review">Under Review</option>
                    <option value="shortlisted">Shortlist / Interview</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>
              </div>

              {/* Match Score Indicator */}
              <div className="flex items-center gap-4 p-4 border border-border rounded-xl">
                <MatchRing score={selectedApplicant.application.matchScore} size="medium" />
                <div>
                  <h4 className="font-bold text-sm text-ink">AI Match Relevance Score</h4>
                  <p className="text-xs text-text-muted">Calculated match index based on qualifications vs. job requirements.</p>
                </div>
              </div>

              {/* Resume download */}
              {selectedApplicant.application.resumeUrl && (
                <div className="flex justify-between items-center p-4 bg-indigo-tint/20 border border-indigo/10 rounded-xl">
                  <span className="text-xs font-semibold text-indigo">Candidate Resume Attachment</span>
                  <a
                    href={getResumeUrl(selectedApplicant.application.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo text-white text-xs font-semibold rounded-button hover:bg-opacity-95 flex items-center gap-1"
                  >
                    <Download size={12} /> View Resume
                  </a>
                </div>
              )}

              {/* AI LaTeX Resume / Overleaf compile */}
              <div className="p-4 bg-canvas border border-border rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-ink uppercase tracking-wider">AI LaTeX Resume (Overleaf)</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Compile and view candidate's tailored LaTeX profile template.</p>
                  </div>
                  {!latexCode ? (
                    <button
                      onClick={fetchLatexResume}
                      disabled={loadingLatex}
                      className="px-3 py-1.5 bg-indigo text-white text-xs font-semibold rounded-button hover:bg-opacity-95 disabled:opacity-50 flex items-center gap-1 shadow-sm transition-all"
                    >
                      {loadingLatex ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Compiling...
                        </>
                      ) : (
                        "Compile LaTeX"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setLatexCode("")}
                      className="text-[10px] font-semibold text-rose hover:underline"
                    >
                      Clear Code
                    </button>
                  )}
                </div>

                {latexCode && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <pre className="p-3 bg-white border border-border rounded-lg text-[10px] font-mono text-ink max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {latexCode}
                    </pre>
                    <div className="flex gap-2">
                      <form
                        action="https://www.overleaf.com/docs"
                        method="POST"
                        target="_blank"
                        className="inline-block"
                      >
                        <input type="hidden" name="snip" value={latexCode} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo text-white text-xs font-semibold rounded-button hover:bg-opacity-95 flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          Open in Overleaf <ExternalLink size={12} />
                        </button>
                      </form>
                      <button
                        onClick={() => {
                          const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${selectedApplicant.seeker.name.replace(/\s+/g, "_")}_Resume.tex`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-3 py-1.5 bg-white border border-border text-ink hover:bg-canvas text-xs font-semibold rounded-button flex items-center gap-1 shadow-sm transition-all"
                      >
                        Download .tex
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Profile Details (Education, Experience, Skills) */}
              {selectedApplicant.seeker.profile ? (
                <div className="space-y-5">
                  {/* Skills */}
                  {selectedApplicant.seeker.profile.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-ink uppercase tracking-wider">Candidate Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplicant.seeker.profile.skills.map((skill, idx) => (
                          <span key={idx} className="text-xs bg-indigo-tint/50 text-indigo px-2.5 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedApplicant.seeker.profile.education.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-ink uppercase tracking-wider">Education</h4>
                      <div className="space-y-2">
                        {selectedApplicant.seeker.profile.education.map((edu, idx) => (
                          <div key={idx} className="text-xs border-l-2 border-indigo/20 pl-3 py-0.5">
                            <p className="font-semibold text-ink">{edu.degree}</p>
                            <p className="text-text-muted mt-0.5">{edu.institution} • {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedApplicant.seeker.profile.experience.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-ink uppercase tracking-wider">Experience</h4>
                      <div className="space-y-2">
                        {selectedApplicant.seeker.profile.experience.map((exp, idx) => (
                          <div key={idx} className="text-xs border-l-2 border-indigo/20 pl-3 py-0.5">
                            <p className="font-semibold text-ink">{exp.role} at {exp.org}</p>
                            <p className="text-text-muted mt-0.5">{exp.durationMonths} months • {exp.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Profile details have not been manually updated by seeker.</p>
              )}
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <button
                onClick={() => handleSelectApplicant(null)}
                className="w-full py-2.5 bg-canvas border border-border text-ink font-semibold rounded-button text-xs hover:bg-border/20"
              >
                Close Candidate Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG components to bypass missing lucide-react typings
const XIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default RecruiterDashboardPage;
