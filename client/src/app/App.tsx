import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Briefcase, FileText, CheckSquare, User, Compass, Sparkles, LogOut, ArrowRight, Award,
} from "lucide-react";
import Providers from "./providers";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import BrowseJobsPage from "../pages/BrowseJobsPage";
import DashboardPage from "../pages/DashboardPage";

// ─── Inline SVG Icons (lucide-react version compat) ─────────────────────────
const Bell = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const Play = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const Check = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ChevronRight = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const Zap = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const Shield = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const Star = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const TrendingUp = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const Brain = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.14Z"/>
  </svg>
);
const MessageSquare = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const BarChart2 = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const Target = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const Rocket = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
import ApplicationsPage from "../pages/ApplicationsPage";
import RecruiterDashboardPage from "../pages/RecruiterDashboardPage";
import RecruiterJobsPage from "../pages/RecruiterJobsPage";
import ResumeAnalyzerPage from "../pages/ResumeAnalyzerPage";
import SkillGapPage from "../pages/SkillGapPage";
import useAuthStore from "../store/auth.store";
import useAuth from "../features/useAuth";
import useNotifications from "../features/useNotifications";
import AiChatbot from "../components/AiChatbot";
import PreparationPage from "../pages/PreparationPage";
import Mascot from "../components/Mascot";
import ParticleBackground from "../components/ParticleBackground";

// ─── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "seeker" | "recruiter";
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
        <div className="w-12 h-12 rounded-full border-4 border-electric-600/30 border-t-electric-600 animate-spin" />
        <p className="text-blue-400/70 text-sm font-medium mt-4">Authenticating...</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRole && user && user.role !== allowedRole)
    return <Navigate to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;
  return <>{children}</>;
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  delay?: number;
}) => (
  <div
    className="bento-card p-6 group cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
      style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `1px solid ${color}33` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <h3 className="text-white font-bold text-lg mb-2 font-display">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>

    {/* Animated bar */}
    <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 group-hover:w-full"
        style={{ width: "40%", background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  </div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({
  title,
  company,
  salary,
  match,
  tag,
  delay = 0,
}: {
  title: string;
  company: string;
  salary: string;
  match: number;
  tag: string;
  delay?: number;
}) => (
  <div
    className="glass-card rounded-2xl p-5 min-w-[260px] flex-shrink-0 cursor-pointer group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
        {company.charAt(0)}
      </div>
      <span className="badge-blue text-[10px]">{tag}</span>
    </div>
    <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors">{title}</h4>
    <p className="text-slate-500 text-xs mb-3">{company}</p>
    <div className="flex items-center justify-between">
      <span className="text-blue-400 text-xs font-medium">{salary}</span>
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-electric-600/20 border border-electric-600/40 flex items-center justify-center">
          <span className="text-blue-400 text-[9px] font-bold">{match}%</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({
  plan,
  price,
  desc,
  features,
  featured = false,
  cta,
}: {
  plan: string;
  price: string;
  desc: string;
  features: string[];
  featured?: boolean;
  cta: string;
}) => (
  <div className={`pricing-card p-8 flex flex-col ${featured ? "featured relative" : ""}`}>
    {featured && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="badge-blue px-4 py-1 text-xs">Most Popular</span>
      </div>
    )}
    <div className="mb-6">
      <h3 className="text-white font-bold text-lg font-display mb-1">{plan}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
    <div className="mb-6">
      <span className="text-4xl font-black text-white font-display">{price}</span>
      {price !== "Custom" && <span className="text-slate-500 text-sm ml-1">/mo</span>}
    </div>
    <ul className="space-y-3 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
          <Check size={14} className="text-blue-400 flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
        featured
          ? "btn-primary"
          : "btn-secondary"
      }`}
    >
      {cta}
    </button>
  </div>
);

// ─── Landing Screen ───────────────────────────────────────────────────────────
const LandingScreen = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [chatMsgIdx, setChatMsgIdx] = useState(0);

  const chatMessages = [
    "Your resume can be improved by 27%.",
    "3 new matching jobs found today.",
    "Interview prep tip: STAR method works best.",
    "Your ATS score is 82 — strong!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setChatMsgIdx((i) => (i + 1) % chatMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated && user)
    return <Navigate to={user.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} replace />;

  return (
    <div className="relative w-full overflow-x-hidden">
      <ParticleBackground />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8 animate-fade-up">
            <div className="section-label">
              <Zap size={12} /> AI-Powered Career Intelligence Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black font-display leading-[1.05] tracking-tight">
              <span className="text-white">Your AI</span>
              <br />
              <span className="text-gradient-blue-purple">Career Copilot</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Find jobs, optimize resumes, prepare for interviews and get hired faster with
              advanced AI that understands your unique career trajectory.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary flex items-center gap-2 min-h-[52px] px-8">
                <Rocket size={16} />
                Start Free
                <ChevronRight size={14} />
              </Link>
              <button className="btn-secondary flex items-center gap-2 min-h-[52px] px-8">
                <Play size={14} className="text-blue-400" />
                Watch Demo
              </button>
            </div>

            {/* Trust Stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { val: "50K+", label: "Jobs Available" },
                { val: "10K+", label: "Users Hired" },
                { val: "95%",  label: "Match Accuracy" },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-black text-white font-display">{val}</span>
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D Robot */}
          <div className="relative flex items-center justify-center animate-fade-right">
            {/* Glow behind robot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full" style={{
                background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
                filter: "blur(40px)",
              }} />
            </div>

            {/* Robot */}
            <Mascot size={420} className="relative z-10 animate-float" />

            {/* Floating chat bubble */}
            <div className="absolute top-8 right-0 lg:-right-4 max-w-[200px] glass-card rounded-2xl p-4 z-20 animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center">
                  <Brain size={12} className="text-white" />
                </div>
                <span className="text-blue-400 text-xs font-semibold">AI Copilot</span>
              </div>
              <p className="text-white text-xs leading-relaxed transition-all duration-500">
                {chatMessages[chatMsgIdx]}
              </p>
            </div>

            {/* Floating match badge */}
            <div className="absolute bottom-16 left-0 lg:-left-8 glass-card rounded-2xl p-4 z-20 animate-float" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-600/20 border border-electric-600/30 flex items-center justify-center">
                  <Target size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">98% Match</div>
                  <div className="text-slate-500 text-xs">Senior Dev @ Google</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: 100000, suf: "+", label: "Resumes Analyzed" },
              { n: 50000,  suf: "+", label: "Jobs Matched" },
              { n: 20000,  suf: "+", label: "Interviews Scheduled" },
              { n: 95,     suf: "%", label: "User Satisfaction" },
            ].map(({ n, suf, label }) => (
              <div key={label} className="text-center glass-card rounded-2xl py-8 px-4">
                <div className="text-4xl md:text-5xl font-black font-display text-gradient-blue mb-2">
                  <Counter end={n} suffix={suf} />
                </div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4">
              <Sparkles size={12} /> Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
              Everything you need to get hired
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A comprehensive AI-powered suite that transforms every step of your job search.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={FileText}     title="AI Resume Builder"        desc="Parse your resume with Gemini AI and get instant structured insights with missing keyword detection and ATS optimization."                color="#2563EB" delay={0} />
            <FeatureCard icon={Target}       title="Smart Job Matching"       desc="Cosine-similarity matching on 768-dim embeddings gives you a precise percentage compatibility score for every role."               color="#06B6D4" delay={100} />
            <FeatureCard icon={MessageSquare}title="Interview Preparation"    desc="AI-powered mock interviews with domain-specific questions, STAR method guidance, and real-time answer evaluation."                    color="#7C3AED" delay={200} />
            <FeatureCard icon={Shield}       title="ATS Optimization"         desc="Score your resume against Applicant Tracking Systems. Get actionable suggestions to pass automated filters every time."              color="#10B981" delay={300} />
            <FeatureCard icon={BarChart2}    title="Career Analytics"         desc="Track response rates, application funnel progress, and benchmark your match scores against other candidates in your field."           color="#F59E0B" delay={400} />
            <FeatureCard icon={Award}        title="Cover Letter Generator"   desc="One-click AI-drafted cover letters tailored to each specific job posting, plus downloadable LaTeX resumes opened in Overleaf."       color="#EC4899" delay={500} />
          </div>
        </div>
      </section>

      {/* ── JOB RECOMMENDATIONS STRIP ─────────────────────── */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <div className="section-label mb-4">
            <TrendingUp size={12} /> Live Job Matches
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display text-white">
            AI-ranked opportunities <span className="text-gradient-blue">waiting for you</span>
          </h2>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar animate-fade-up">
          {[
            { title: "Senior Frontend Engineer", company: "Google",    salary: "₹32–45 LPA", match: 97, tag: "Remote" },
            { title: "ML Engineer",              company: "Microsoft", salary: "₹40–55 LPA", match: 94, tag: "Hybrid" },
            { title: "Full Stack Developer",     company: "Stripe",    salary: "₹28–38 LPA", match: 91, tag: "Onsite" },
            { title: "Product Designer",         company: "Figma",     salary: "₹22–30 LPA", match: 89, tag: "Remote" },
            { title: "DevOps Engineer",          company: "AWS",       salary: "₹35–50 LPA", match: 86, tag: "Hybrid" },
            { title: "Backend Developer",        company: "Razorpay",  salary: "₹18–28 LPA", match: 83, tag: "Onsite" },
          ].map((job, i) => (
            <JobCard key={i} {...job} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── AI DASHBOARD PREVIEW ──────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4">
              <Brain size={12} /> AI Dashboard
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
              Your intelligent career command center
            </h2>
          </div>

          {/* Dashboard Mockup */}
          <div className="glass-card rounded-3xl p-6 md:p-10 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {[
                { label: "Match Score",        val: "94%",  color: "#2563EB", icon: Target },
                { label: "Resume ATS Score",   val: "82/100", color: "#06B6D4", icon: Shield },
                { label: "Jobs Applied",       val: "12",   color: "#7C3AED", icon: Briefcase },
              ].map(({ label, val, color, icon: Icon }) => (
                <div key={label} className="bento-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 text-xs font-medium">{label}</span>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="text-3xl font-black font-display text-white">{val}</div>
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: "75%", background: `linear-gradient(90deg, ${color}, transparent)` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Top matches preview */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm mb-4">Top AI Recommendations</h3>
              {[
                { title: "Senior React Developer", company: "Notion", match: 97, status: "New" },
                { title: "AI/ML Engineer",          company: "OpenAI", match: 95, status: "Applied" },
                { title: "Full Stack Engineer",     company: "Vercel", match: 91, status: "New" },
              ].map(({ title, company, match, status }) => (
                <div key={title} className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/6 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {company.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">{title}</div>
                      <div className="text-slate-500 text-xs">{company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-blue-400 text-xs font-bold">{match}%</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${status === "Applied" ? "bg-emerald/20 text-emerald border border-emerald/30" : "badge-blue"}`}>{status}</span>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESUME ANALYZER ───────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-fade-left">
            <div className="section-label">
              <FileText size={12} /> Resume Intelligence
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white leading-tight">
              AI that reads your resume like a <span className="text-gradient-cyan">senior recruiter</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Upload your resume and our Gemini AI instantly analyzes your profile, calculates ATS compatibility,
              identifies missing keywords and generates tailored improvement suggestions.
            </p>
            <div className="space-y-3">
              {["ATS Score & Keyword Analysis", "Skill Gap Detection", "AI-powered Improvement Tips", "One-click Cover Letter Generation"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-electric-600/20 border border-electric-600/40 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-blue-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Analyze My Resume <ArrowRight size={14} />
            </Link>
          </div>

          {/* Score Ring Mockup */}
          <div className="relative flex items-center justify-center animate-fade-right">
            <div className="glass-card rounded-3xl p-8 w-full max-w-sm mx-auto">
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#blueGrad)" strokeWidth="10"
                      strokeDasharray="314" strokeDashoffset="56" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-display text-white">82</span>
                    <span className="text-xs text-slate-500">ATS Score</span>
                  </div>
                </div>
                <div className="badge-blue mx-auto">Strong Profile</div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Keywords Match", val: 78, color: "#2563EB" },
                  { label: "Formatting",     val: 92, color: "#06B6D4" },
                  { label: "Skills Coverage",val: 85, color: "#7C3AED" },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{label}</span>
                      <span style={{ color }}>{val}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4">
              <Star size={12} /> Pricing Plans
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-400 text-lg">Start free. Scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              plan="Starter"
              price="Free"
              desc="Perfect to get started"
              features={["5 AI job matches/month", "Basic resume analysis", "Cover letter generator", "Application tracking"]}
              cta="Get Started Free"
            />
            <div className="gradient-border">
              <PricingCard
                plan="Professional"
                price="₹999"
                desc="For serious job seekers"
                features={["Unlimited AI matches", "Advanced ATS optimization", "Mock interview prep", "Priority AI support", "Career analytics dashboard", "LaTeX resume export"]}
                featured
                cta="Start Pro Trial"
              />
            </div>
            <PricingCard
              plan="Enterprise"
              price="Custom"
              desc="For teams & companies"
              features={["Bulk candidate matching", "Custom integrations", "Dedicated account manager", "Analytics & reporting", "SSO & security controls", "SLA guarantee"]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="py-16 px-6 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white font-bold font-display text-xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">G</div>
                AI Job Seeker
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                The most advanced AI-powered recruitment platform. Get hired faster with intelligent career tools.
              </p>
            </div>
            {[
              { title: "Product",   items: ["Features", "Resume AI", "Job Match", "Interview Prep", "Pricing"] },
              { title: "Resources", items: ["Documentation", "Blog", "Career Tips", "API Reference"] },
              { title: "Company",   items: ["About Us", "Careers", "Privacy Policy", "Terms of Service", "Contact"] },
            ].map(({ title, items }) => (
              <div key={title}>
                <h4 className="text-white font-semibold text-sm mb-4 font-display">{title}</h4>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2026 AI Job Seeker. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── App Layout (authenticated pages) ────────────────────────────────────────
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isPublicPage = ["/", "/login", "/signup"].includes(location.pathname);

  const [showNotifications, setShowNotifications] = useState(false);
  const { useGetMyNotifications, useMarkNotificationRead } = useNotifications();
  const isSeeker = isAuthenticated && user?.role === "seeker";
  const { data: notifData } = useGetMyNotifications(isSeeker);
  const markReadMutation = useMarkNotificationRead();
  const notifications = notifData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#020617] relative">
        {/* Navbar for public/auth pages */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <nav className="max-w-7xl mx-auto glass-card rounded-2xl px-6 h-14 flex items-center justify-between border border-white/10">
            <Link to="/" className="flex items-center gap-2 text-white font-bold font-display text-lg">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">G</div>
              AI Job Seeker
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm">
              {["Features", "Resume AI", "Job Match", "Pricing"].map((item) => (
                <a key={item} href="#" className="text-slate-400 hover:text-white transition-colors">{item}</a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log In</Link>
                  <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </>
              ) : (
                <Link to={user?.role === "recruiter" ? "/recruiter/dashboard" : "/dashboard"} className="btn-primary text-sm px-4 py-2">
                  Dashboard
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main>{children}</main>
      </div>
    );
  }

  // Determine navigation items
  const isRecruiter = user?.role === "recruiter";
  const navItems = isRecruiter
    ? [
        { label: "Dashboard",    path: "/recruiter/dashboard", icon: Compass },
        { label: "My Postings",  path: "/recruiter/jobs",      icon: Briefcase },
      ]
    : [
        { label: "Dashboard",        path: "/dashboard",    icon: Compass },
        { label: "Browse Jobs",      path: "/jobs",         icon: Briefcase },
        { label: "Resume Analyzer",  path: "/resume",       icon: FileText },
        { label: "Preparation",      path: "/preparation",  icon: Sparkles },
        { label: "Applications",     path: "/applications", icon: CheckSquare },
        { label: "Profile",          path: "/profile",      icon: User },
      ];

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--color-canvas)" }}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[#0F172A]/80 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold font-display text-lg flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">G</div>
            AI Job Seeker
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-electric-600/15 text-blue-400 shadow-glow-sm border border-electric-600/20"
                      : "text-slate-500 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isSeeker && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 glass-card rounded-2xl shadow-glow-blue border border-white/10 z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/8">
                      <h4 className="text-white font-semibold text-sm">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">All caught up!</div>
                      ) : (
                        notifications.slice(0, 6).map((n: any) => (
                          <div
                            key={n._id}
                            onClick={() => markReadMutation.mutate(n._id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/4 transition-colors ${!n.read ? "bg-electric-600/5" : ""}`}
                          >
                            <p className="text-slate-300 text-xs leading-relaxed">{n.message}</p>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-electric-600 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-slate-300 text-xs font-medium hidden sm:block">{user?.name?.split(" ")[0] || "User"}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-rose/10 text-slate-500 hover:text-rose transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* AI Chatbot */}
      {isAuthenticated && user?.role === "seeker" && <AiChatbot />}
    </div>
  );
};

// ─── App Content ──────────────────────────────────────────────────────────────
export const AppContent = () => {
  const { isLoading } = useAuthStore();
  useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
        <div className="w-12 h-12 rounded-full border-4 border-electric-600/30 border-t-electric-600 animate-spin" />
        <p className="text-blue-400/70 text-sm font-medium mt-4">Loading session...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<LandingScreen />} />
        <Route path="/login"  element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Seeker */}
        <Route path="/dashboard"   element={<ProtectedRoute allowedRole="seeker"><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs"        element={<ProtectedRoute allowedRole="seeker"><BrowseJobsPage /></ProtectedRoute>} />
        <Route path="/resume"      element={<ProtectedRoute allowedRole="seeker"><ResumeAnalyzerPage /></ProtectedRoute>} />
        <Route path="/preparation" element={<ProtectedRoute allowedRole="seeker"><PreparationPage /></ProtectedRoute>} />
        <Route path="/applications"element={<ProtectedRoute allowedRole="seeker"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute allowedRole="seeker"><OnboardingPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/gap"element={<ProtectedRoute allowedRole="seeker"><SkillGapPage /></ProtectedRoute>} />

        {/* Recruiter */}
        <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRole="recruiter"><RecruiterDashboardPage /></ProtectedRoute>} />
        <Route path="/recruiter/jobs"      element={<ProtectedRoute allowedRole="recruiter"><RecruiterJobsPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <Providers>
    <Router>
      <AppContent />
    </Router>
  </Providers>
);

export default App;
