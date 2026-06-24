import React, { useState } from "react";
import ParticleBackground from "../components/ParticleBackground";
import Mascot from "../components/Mascot";

// Icons
const BookOpen = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const CodeIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
);
const MessageIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const CheckCircleIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const ChevronDownIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevronRightIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"/></svg>
);
const StarIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const ZapIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const TargetIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const TrophyIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
);
const ArrowRightIcon = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const LightbulbIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

type TabId = "basics" | "technical" | "interview";

interface AccordionItem { question: string; answer: string; tip?: string; }
interface SkillCardData { icon: string; title: string; level: string; topics: string[]; color: string; accent: string; }
interface InterviewQ { category: string; question: string; framework?: string; example: string; keywords: string[]; }

const basicsData: AccordionItem[] = [
  { question: "How do I identify the right job roles for me?", answer: "Start by auditing your hard skills (tools, technologies, certifications) and soft skills (communication, leadership). Cross-reference these with job postings in your target industry using job boards like LinkedIn, Indeed, or Glassdoor. Look for roles where you match 60-70% of requirements — you do not need to be a perfect fit to apply.", tip: "Create a T-shaped profile: deep expertise in one area + broad knowledge across adjacent fields." },
  { question: "How do I write a resume that stands out?", answer: "Use the STAR format (Situation, Task, Action, Result) for bullet points. Quantify achievements wherever possible — for example 'Increased API performance by 40%'. Tailor the top third of your resume to each job description. Use an ATS-friendly format — avoid tables, graphics, and custom fonts in the main body.", tip: "Each bullet point should answer: So what? Always end with the impact." },
  { question: "What is ATS and how do I beat it?", answer: "ATS (Applicant Tracking System) is software that screens resumes before a human sees them. To pass ATS: use standard section headers (Experience, Education, Skills), mirror exact keywords from the job description, save your resume as a .docx or .pdf, and avoid headers/footers for critical info.", tip: "Use our Resume Analyzer tool to get an ATS compatibility score before applying." },
  { question: "How do I write a compelling cover letter?", answer: "Open with a hook that shows genuine excitement for the role. Paragraph 2: explain why your background is uniquely suited with 1-2 specific examples. Paragraph 3: show you have researched the company and explain what you would contribute. Close with a confident call-to-action. Keep it under 300 words.", tip: "Personalization is everything — mention a specific project or value from the company website." },
  { question: "How should I negotiate my salary?", answer: "Research market rates using Glassdoor, Levels.fyi, or LinkedIn Salary. Always let the employer name a number first if possible. When countering, anchor high (15-20% above your target) and explain your value. Never accept or decline on the spot — ask for 24-48 hours. Consider the full package: equity, bonuses, PTO, remote flexibility.", tip: "The best negotiating position is always when you have another offer. Apply broadly!" },
  { question: "What is the best way to network effectively?", answer: "Warm outreach beats cold applications. Connect with alumni, former colleagues, and people at target companies. Use LinkedIn to find 2nd-degree connections. Send personalized messages referencing a specific post or project. Offer value before asking for referrals. Attend virtual meetups, hackathons, and industry conferences.", tip: "A referral increases your interview chances by 5-10x compared to a cold application." },
];

const skillCards: SkillCardData[] = [
  { icon: "🗄️", title: "Data Structures & Algorithms", level: "Beginner", color: "from-violet-500/20 to-purple-500/10", accent: "#a78bfa", topics: ["Arrays & Strings", "Hash Maps & Sets", "Linked Lists", "Stacks & Queues", "Binary Search", "Sorting Algorithms", "Trees & Graphs", "Dynamic Programming"] },
  { icon: "🌐", title: "Web Development Fundamentals", level: "Beginner", color: "from-sky-500/20 to-cyan-500/10", accent: "#38bdf8", topics: ["HTML5 Semantics", "CSS Flexbox & Grid", "JavaScript ES6+", "REST APIs", "React / Vue basics", "HTTP & CORS", "Browser DevTools", "Responsive Design"] },
  { icon: "🏗️", title: "System Design", level: "Intermediate", color: "from-amber-500/20 to-orange-500/10", accent: "#fbbf24", topics: ["Load Balancing", "Caching Strategies", "Database Sharding", "CAP Theorem", "Message Queues", "Microservices", "CDN & Edge", "Rate Limiting"] },
  { icon: "☁️", title: "Cloud & DevOps", level: "Intermediate", color: "from-emerald-500/20 to-teal-500/10", accent: "#34d399", topics: ["AWS / GCP / Azure", "Docker & Kubernetes", "CI/CD Pipelines", "Infrastructure as Code", "Git & Version Control", "Monitoring & Logging", "Security Best Practices", "Serverless Architecture"] },
  { icon: "🤖", title: "AI & Machine Learning", level: "Advanced", color: "from-rose-500/20 to-pink-500/10", accent: "#fb7185", topics: ["Python & NumPy", "Linear / Logistic Regression", "Neural Networks", "NLP Fundamentals", "Model Evaluation", "Feature Engineering", "LLMs & Prompt Engineering", "MLOps Pipelines"] },
  { icon: "🔐", title: "Cybersecurity Basics", level: "Advanced", color: "from-slate-500/20 to-gray-500/10", accent: "#94a3b8", topics: ["OWASP Top 10", "Auth (OAuth / JWT)", "SQL Injection & XSS", "Encryption & Hashing", "Network Security", "Penetration Testing", "Zero Trust Model", "Incident Response"] },
];

const interviewQuestions: InterviewQ[] = [
  { category: "Behavioral", question: "Tell me about yourself.", framework: "Present–Past–Future", example: "Start with your current role/status. Briefly cover relevant past experience. End with why you are excited about this specific opportunity. Keep it to 90 seconds. Example: I am currently a final-year CS student specializing in full-stack development. Over the last two years I built three production apps and completed internships at two SaaS startups. I am excited about this role because your team is solving the exact problem I researched in my thesis.", keywords: ["current role", "relevant experience", "why this company", "excited"] },
  { category: "Behavioral", question: "Describe a time you faced a major challenge at work.", framework: "STAR (Situation, Task, Action, Result)", example: "Situation: Our main database was timing out during peak traffic. Task: Fix it within 48 hours. Action: I profiled slow queries, added strategic indexes, and implemented Redis caching for hot data. Result: Query time dropped from 3s to 120ms, reducing timeouts to zero.", keywords: ["quantified result", "specific action", "ownership", "impact"] },
  { category: "Behavioral", question: "How do you handle disagreements with teammates?", framework: "STAR", example: "Describe a situation where you disagreed on a technical approach. Explain how you listened actively, presented data and evidence for your viewpoint, and ultimately prioritized the team decision or found a compromise. Emphasize respect and outcome focus.", keywords: ["empathy", "data-driven", "compromise", "team outcome"] },
  { category: "Technical", question: "What is the difference between SQL and NoSQL databases?", framework: "Compare & Contrast", example: "SQL: structured, ACID-compliant, great for relational data with complex joins e.g. PostgreSQL. NoSQL: flexible schema, horizontally scalable, ideal for unstructured or rapidly evolving data e.g. MongoDB. Choose based on consistency needs, query patterns, and scale requirements.", keywords: ["ACID", "schema", "horizontal scaling", "trade-offs"] },
  { category: "Technical", question: "How would you design a URL shortener like bit.ly?", framework: "System Design Framework", example: "1) Clarify requirements (scale, latency, analytics). 2) API design: POST /shorten, GET /{code}. 3) Database: key-value store (Redis) for lookups + SQL for analytics. 4) ID generation: Base62 encoding of an auto-incremented ID. 5) Handle redirects with 301/302 and CDN for global low latency.", keywords: ["requirements", "scalability", "hashing", "CDN", "database choice"] },
  { category: "HR / Motivation", question: "Why do you want to work here?", framework: "3-Point Structure", example: "Point 1: Company mission alignment — reference a specific product or initiative. Point 2: Team/tech stack — mention what excites you technically. Point 3: Growth opportunity — explain how this role accelerates your career path. Avoid generic answers.", keywords: ["company research", "mission", "specific product", "career growth"] },
  { category: "HR / Motivation", question: "Where do you see yourself in 5 years?", framework: "Growth Narrative", example: "Frame your answer around skill development and contribution, not just titles. Example: I see myself having built deep expertise in distributed systems, contributing to architectural decisions, and potentially mentoring junior engineers. I want to be someone this team relies on for complex technical problems.", keywords: ["skill growth", "contribution", "realistic", "aligned with company"] },
  { category: "Technical", question: "Explain how async/await works in JavaScript.", framework: "Concept + Mechanism + Example", example: "async/await is syntactic sugar over Promises. An async function always returns a Promise. await pauses execution of the async function until the Promise resolves without blocking the event loop. The JS engine uses a microtask queue to resume execution. Common pitfall: forgetting to handle errors with try/catch.", keywords: ["Promise", "non-blocking", "event loop", "error handling"] },
];

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Advanced: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

const categoryColors: Record<string, string> = {
  Behavioral: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  Technical: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  "HR / Motivation": "text-amber-400 bg-amber-400/10 border-amber-400/30",
};

const AccordionCard: React.FC<{ item: AccordionItem; index: number }> = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-surface ${open ? "border-indigo/40 shadow-lg shadow-indigo/5" : "border-border hover:border-indigo/20"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left gap-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-indigo/10 text-indigo text-sm font-bold flex items-center justify-center shrink-0">{index + 1}</span>
          <span className="font-semibold text-ink text-sm md:text-base">{item.question}</span>
        </div>
        <ChevronDownIcon size={18} className={`text-text-muted shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          <p className="text-text-muted text-sm leading-relaxed border-l-2 border-indigo/30 pl-4">{item.answer}</p>
          {item.tip && (
            <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <LightbulbIcon size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-400/90 font-medium">{item.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SkillCard: React.FC<{ card: SkillCardData }> = ({ card }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${card.color} p-5 flex flex-col gap-4 cursor-pointer hover:border-white/20 transition-all duration-300 hover:-translate-y-1`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{card.icon}</span>
          <div>
            <h3 className="font-bold text-ink text-sm md:text-base">{card.title}</h3>
            <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${levelColors[card.level]}`}>{card.level}</span>
          </div>
        </div>
        <ChevronRightIcon size={18} className={`text-text-muted mt-1 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
      </div>
      {expanded ? (
        <div className="grid grid-cols-2 gap-2">
          {card.topics.map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: card.accent }} />{t}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {card.topics.slice(0, 3).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-text-muted border-white/10">{t}</span>)}
          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-text-muted border-white/10">+{card.topics.length - 3} more</span>
        </div>
      )}
    </div>
  );
};

const InterviewCard: React.FC<{ q: InterviewQ }> = ({ q }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-surface ${open ? "border-indigo/40 shadow-lg shadow-indigo/5" : "border-border hover:border-indigo/20"}`}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 mt-0.5 ${categoryColors[q.category]}`}>{q.category}</span>
          <span className="font-semibold text-ink text-sm md:text-base leading-snug">{q.question}</span>
        </div>
        <ChevronDownIcon size={18} className={`text-text-muted shrink-0 transition-transform duration-300 mt-1 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          {q.framework && (
            <div className="flex items-center gap-2">
              <TargetIcon size={14} className="text-indigo" />
              <span className="text-xs font-bold text-indigo uppercase tracking-widest">Framework: {q.framework}</span>
            </div>
          )}
          <p className="text-text-muted text-sm leading-relaxed border-l-2 border-indigo/30 pl-4">{q.example}</p>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Key Words to Use</p>
            <div className="flex flex-wrap gap-2">
              {q.keywords.map((kw) => <span key={kw} className="text-[11px] px-2.5 py-1 rounded-full bg-indigo/10 text-indigo border border-indigo/20 font-medium">{kw}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span className="text-xs font-bold text-ink">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-border overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  </div>
);

const TabBtn = ({ active, onClick, icon, label, sublabel }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; sublabel: string }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 px-4 py-4 rounded-2xl border transition-all duration-300 text-left ${active ? "border-indigo/50 bg-indigo/8 shadow-lg shadow-indigo/5" : "border-border bg-surface hover:border-indigo/20 hover:bg-canvas"}`}>
    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-indigo text-white" : "bg-canvas text-text-muted"}`}>{icon}</span>
    <div>
      <p className={`font-bold text-sm ${active ? "text-indigo" : "text-ink"}`}>{label}</p>
      <p className="text-[11px] text-text-muted leading-tight hidden sm:block">{sublabel}</p>
    </div>
  </button>
);

export const PreparationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("basics");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const checklist = [
    { key: "resume", label: "Resume polished & ATS-optimized" },
    { key: "linkedin", label: "LinkedIn profile updated with keywords" },
    { key: "github", label: "GitHub / portfolio showcases projects" },
    { key: "companies", label: "Target company list researched (5-10)" },
    { key: "stories", label: "3-5 STAR stories prepared" },
    { key: "questions", label: "Questions ready to ask the interviewer" },
    { key: "practice", label: "Practiced answers out loud / recorded" },
    { key: "logistics", label: "Interview logistics confirmed (time, link, attire)" },
  ];

  const readinessScore = Math.round((checkedItems.size / checklist.length) * 100);

  return (
    <div className="relative min-h-screen text-ink overflow-hidden pb-20">
      <ParticleBackground />

      <div className="fixed bottom-8 right-8 w-32 h-32 z-50 pointer-events-none hidden lg:block">
        <Mascot size={128} className="pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo/10 border border-indigo/20 text-indigo text-xs font-semibold uppercase tracking-wider">
            <TrophyIcon size={12} /><span>Job Preparation Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink">Get <span className="text-indigo">Interview-Ready</span> in 3 Steps</h1>
          <p className="text-text-muted max-w-xl mx-auto text-sm leading-relaxed">Master the fundamentals, build technical skills, and confidently ace every interview — your complete roadmap from zero to offer.</p>
        </div>

        {/* Progress strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Job Market Basics", value: 75, color: "#6366f1" },
            { label: "Technical Skills", value: 55, color: "#38bdf8" },
            { label: "Interview Readiness", value: readinessScore, color: "#34d399" },
          ].map((p) => (
            <div key={p.label} className="bg-surface border border-border rounded-2xl p-4 shadow-sm">
              <ProgressBar label={p.label} value={p.value} color={p.color} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <TabBtn active={activeTab === "basics"} onClick={() => setActiveTab("basics")} icon={<BookOpen size={18} />} label="Job Basics" sublabel="Resume, ATS, networking & salary" />
          <TabBtn active={activeTab === "technical"} onClick={() => setActiveTab("technical")} icon={<CodeIcon size={18} />} label="Technical Skills" sublabel="DSA, system design, cloud & more" />
          <TabBtn active={activeTab === "interview"} onClick={() => setActiveTab("interview")} icon={<MessageIcon size={18} />} label="Interview Prep" sublabel="Behavioral, technical & HR questions" />
        </div>

        {/* ── BASICS ── */}
        {activeTab === "basics" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center"><BookOpen size={18} /></div>
              <div><h2 className="font-bold text-lg text-ink">Job Search Fundamentals</h2><p className="text-xs text-text-muted">Everything you need before sending a single application</p></div>
            </div>
            <div className="bg-gradient-to-r from-indigo/10 to-violet-500/5 border border-indigo/20 rounded-2xl p-4 flex items-start gap-3">
              <ZapIcon size={18} className="text-indigo mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-ink">Pro Tip</p>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">Spend 20% of your time on applications and 80% on preparation + networking. Quality always beats quantity in job searching.</p>
              </div>
            </div>
            <div className="space-y-3">{basicsData.map((item, i) => <AccordionCard key={i} item={item} index={i} />)}</div>
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2"><StarIcon size={14} className="text-amber-400" /> Recommended Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Analyze your resume for ATS score", path: "/resume", cta: "Open Resume Analyzer" },
                  { label: "Find jobs matching your profile", path: "/jobs", cta: "Browse Jobs" },
                  { label: "Identify skill gaps for target roles", path: "/jobs", cta: "View Skill Gap" },
                  { label: "Get AI cover letter drafts", path: "/jobs", cta: "Browse & Apply" },
                ].map((r) => (
                  <a key={r.label} href={r.path} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border hover:border-indigo/30 hover:bg-canvas transition-all group">
                    <span className="text-xs text-text-muted leading-tight">{r.label}</span>
                    <span className="text-xs text-indigo font-semibold whitespace-nowrap flex items-center gap-1 group-hover:gap-2 transition-all">{r.cta} <ArrowRightIcon size={12} /></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TECHNICAL ── */}
        {activeTab === "technical" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center"><CodeIcon size={18} /></div>
              <div><h2 className="font-bold text-lg text-ink">Technical Skill Roadmap</h2><p className="text-xs text-text-muted">Click any card to explore all topics in that skill area</p></div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => <span key={lvl} className={`px-3 py-1 rounded-full border font-semibold ${levelColors[lvl]}`}>{lvl}</span>)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillCards.map((card) => <SkillCard key={card.title} card={card} />)}
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-ink text-sm flex items-center gap-2"><TargetIcon size={14} className="text-indigo" /> Suggested 8-Week Study Plan</h3>
              <div className="space-y-2">
                {[
                  { week: "Week 1-2", focus: "DSA Fundamentals", detail: "Arrays, Hash Maps, Binary Search, Sorting" },
                  { week: "Week 3-4", focus: "Web & System Concepts", detail: "REST APIs, Databases, Caching, Load Balancing" },
                  { week: "Week 5-6", focus: "Advanced DSA", detail: "Trees, Graphs, Dynamic Programming, Backtracking" },
                  { week: "Week 7", focus: "Cloud & DevOps Basics", detail: "Docker, Git, CI/CD, Basic AWS" },
                  { week: "Week 8", focus: "Mock Projects & Portfolio", detail: "Build 1 full-stack project showcasing all skills" },
                ].map((item) => (
                  <div key={item.week} className="flex items-start gap-3 p-3 rounded-xl hover:bg-canvas transition-colors">
                    <span className="text-[10px] font-bold text-indigo bg-indigo/10 border border-indigo/20 px-2 py-1 rounded-lg shrink-0 mt-0.5 whitespace-nowrap">{item.week}</span>
                    <div><p className="text-sm font-semibold text-ink">{item.focus}</p><p className="text-xs text-text-muted">{item.detail}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── INTERVIEW ── */}
        {activeTab === "interview" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center"><MessageIcon size={18} /></div>
              <div><h2 className="font-bold text-lg text-ink">Interview Preparation</h2><p className="text-xs text-text-muted">Master every type of question with frameworks and examples</p></div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {["Behavioral", "Technical", "HR / Motivation"].map((cat) => <span key={cat} className={`px-3 py-1 rounded-full border font-semibold ${categoryColors[cat]}`}>{cat}</span>)}
            </div>
            <div className="space-y-3">{interviewQuestions.map((q, i) => <InterviewCard key={i} q={q} />)}</div>

            {/* Readiness Checklist */}
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink text-sm flex items-center gap-2"><CheckCircleIcon size={14} className="text-emerald-400" /> Pre-Interview Readiness Checklist</h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">{checkedItems.size}/{checklist.length} done</span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${readinessScore}%` }} />
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button key={item.key} onClick={() => toggleCheck(item.key)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-canvas transition-all text-left group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checkedItems.has(item.key) ? "bg-emerald-400 border-emerald-400" : "border-border group-hover:border-emerald-400/50"}`}>
                      {checkedItems.has(item.key) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5 5 4 7.5 8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className={`text-sm transition-colors ${checkedItems.has(item.key) ? "line-through text-text-muted" : "text-ink"}`}>{item.label}</span>
                  </button>
                ))}
              </div>
              {readinessScore === 100 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
                  <TrophyIcon size={20} className="text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-400">You are fully interview-ready! Go get that offer!</p>
                </div>
              )}
            </div>

            {/* Day-of tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "⏰", title: "Day Before", tips: ["Research interviewer on LinkedIn", "Prepare your setup (camera, mic, lighting)", "Get 8 hours of sleep", "Lay out your outfit"] },
                { icon: "🎯", title: "Day Of Interview", tips: ["Log in 5 minutes early", "Have water & notes nearby", "Breathe — slow down before answering", "End with 2-3 thoughtful questions"] },
              ].map((block) => (
                <div key={block.title} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-ink text-sm flex items-center gap-2"><span>{block.icon}</span> {block.title}</h3>
                  <ul className="space-y-2">
                    {block.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-xs text-text-muted">
                        <ArrowRightIcon size={10} className="text-indigo mt-1 shrink-0" />{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreparationPage;
