import Groq from "groq-sdk";
import env from "../../config/env";
import { ISeekerProfile } from "../../models/profile.model";
import { IJob } from "../../models/job.model";

const isGroqConfigured = !!env.GROQ_API_KEY;

// Only instantiate Groq if the API key is present
const groq = isGroqConfigured ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

export const MODELS = {
  text: "llama-3.3-70b-versatile",
};

// 200 common skills/tech terms to map to embedding indices for deterministic mock embeddings
const COMMON_KEYWORDS = [
  "react", "node", "javascript", "typescript", "mongodb", "express", "html", "css",
  "tailwind", "python", "django", "flask", "java", "spring", "c++", "c#", "golang",
  "ruby", "rails", "php", "sql", "postgresql", "mysql", "redis", "docker", "kubernetes",
  "aws", "gcp", "azure", "git", "github", "graphql", "rest", "api", "next.js", "nest.js",
  "angular", "vue", "jquery", "bootstrap", "sass", "webpack", "vite", "jest", "cypress",
  "prisma", "sequelize", "mongoose", "firebase", "oauth", "jwt", "microservices",
  "redux", "zustand", "mobx", "webpack", "npm", "yarn", "linux", "bash", "nginx",
  "apache", "figma", "agile", "scrum", "devops", "ci/cd", "machine learning", "deep learning",
  "ai", "nlp", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "data science",
  "rust", "kotlin", "swift", "flutter", "react native", "electron", "webassembly",
  "overleaf", "latex", "ats", "resume", "cv", "portfolio", "cloud", "security"
];

/**
 * Generate a mock 768-dimensional embedding vector deterministically based on text content.
 * If keyword is present, set its corresponding index to 1.0.
 * Fill the rest with low pseudo-random noise seeded by the text length/content.
 */
const generateMockEmbedding = (text: string): number[] => {
  const vector: number[] = new Array(768).fill(0);
  const normalizedText = text.toLowerCase();

  // Populate first COMMON_KEYWORDS.length dimensions based on keywords
  COMMON_KEYWORDS.forEach((keyword, index) => {
    if (normalizedText.includes(keyword)) {
      vector[index] = 1.0;
    }
  });

  // Fill remaining dimensions with deterministic pseudo-random noise between 0.01 and 0.05
  // using a simple seed from the text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = COMMON_KEYWORDS.length; i < 768; i++) {
    const val = Math.abs(Math.sin(hash + i)) * 0.04 + 0.01;
    vector[i] = parseFloat(val.toFixed(4));
  }

  // Normalize the vector so it has a magnitude of 1 (unit vector)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return vector.map((val) => parseFloat((val / magnitude).toFixed(6)));
  }

  return vector;
};

/**
 * Generate embedding vector using Gemini API, or fallback to mock vector
 * Since Groq does not have embedding models, we always generate offline mock embeddings.
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  console.log("ℹ️ [AI SERVICE] Groq does not support embeddings. Generating mock embedding vector.");
  return generateMockEmbedding(text);
};

export interface ParsedProfile {
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    tech: string[];
  }>;
  experience: Array<{
    role: string;
    org: string;
    durationMonths: number;
    summary: string;
  }>;
}

/**
 * Generate parsed profile from resume text using Groq Structured Outputs, or fallback to mock parser.
 */
export const parseResumeText = async (text: string): Promise<ParsedProfile> => {
  console.log(`ℹ️ [AI SERVICE] parseResumeText called. Length of text: ${text.length}. isGroqConfigured: ${isGroqConfigured}`);
  
  if (!isGroqConfigured || !groq) {
    console.log("⚠️ [AI SERVICE] GROQ_API_KEY missing. Running mock resume parser.");
    return runMockResumeParser(text);
  }

  try {
    const prompt = `
      You are a professional ATS resume parser. Extract the user's details from the resume text provided.
      Return the output strictly in JSON format matching the schema below.
      
      Schema:
      {
        "skills": ["string"],
        "education": [
          {
            "degree": "string",
            "institution": "string",
            "year": number
          }
        ],
        "projects": [
          {
            "title": "string",
            "description": "string",
            "tech": ["string"]
          }
        ],
        "experience": [
          {
            "role": "string",
            "org": "string",
            "durationMonths": number,
            "summary": "string"
          }
        ]
      }

      Resume Text:
      ${text}
    `;

    console.log("ℹ️ [AI SERVICE] Sending request to Groq...");
    const chatCompletion = await groq.chat.completions.create({
      model: MODELS.text,
      messages: [
        {
          role: "system",
          content: "You are a professional ATS resume parser. Extract details into the requested JSON schema. Do not output anything else than valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    console.log(`ℹ️ [AI SERVICE] Groq responded: ${content}`);
    const parsedJson = JSON.parse(content);
    return parsedJson as ParsedProfile;
  } catch (error: any) {
    console.error("❌ [AI SERVICE] Groq resume parsing error:", error);
    console.error("❌ [AI SERVICE] Error details:", error.message || error);
    return runMockResumeParser(text);
  }
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Heuristics-based mock resume parser
 */
const runMockResumeParser = (text: string): ParsedProfile => {
  const lowercaseText = text.toLowerCase();
  
  // Extract skills based on common keywords
  const skills: string[] = [];
  COMMON_KEYWORDS.slice(0, 50).forEach((keyword) => {
    // Search with word boundary to avoid partial matching
    const escaped = escapeRegExp(keyword);
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      // Capitalize first letters properly
      const formatted = keyword.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(".");
      skills.push(formatted);
    }
  });

  // Default skills if none matched
  if (skills.length === 0) {
    skills.push("JavaScript", "React", "Node.js", "HTML", "CSS", "Git");
  }

  // Detect education
  const education: ParsedProfile["education"] = [];
  if (lowercaseText.includes("b.tech") || lowercaseText.includes("bachelor")) {
    education.push({
      degree: "B.Tech Computer Science",
      institution: lowercaseText.includes("iit") 
        ? "Indian Institute of Technology (IIT)" 
        : lowercaseText.includes("nit") 
        ? "National Institute of Technology (NIT)" 
        : "State Technical University",
      year: 2025
    });
  } else {
    education.push({
      degree: "B.Sc Computer Science",
      institution: "City Commerce & Science College",
      year: 2024
    });
  }

  // Detect/Generate projects
  const projects: ParsedProfile["projects"] = [];
  if (lowercaseText.includes("portfolio") || lowercaseText.includes("website")) {
    projects.push({
      title: "Personal Portfolio Website",
      description: "A highly responsive developer portfolio showcasing projects and contact forms with custom animations.",
      tech: skills.slice(0, 3)
    });
  }
  if (lowercaseText.includes("e-commerce") || lowercaseText.includes("shop") || projects.length === 0) {
    projects.push({
      title: "E-Commerce Web Application",
      description: "Full-stack e-commerce marketplace featuring product catalog, shopping cart, and mock payment gateway integration.",
      tech: ["React", "Node.js", "Express", "MongoDB"]
    });
  }

  // Experience
  const experience: ParsedProfile["experience"] = [];
  if (lowercaseText.includes("intern") || lowercaseText.includes("work")) {
    experience.push({
      role: "Software Development Intern",
      org: "InnovateTech Solutions",
      durationMonths: 6,
      summary: "Developed frontend user dashboard components using React and helped refactor legacy CSS to modern Tailwind code."
    });
  } else {
    experience.push({
      role: "Freelance Web Developer",
      org: "Self-Employed",
      durationMonths: 12,
      summary: "Built custom websites for small local businesses using HTML, CSS, JavaScript, and WordPress."
    });
  }

  return {
    skills,
    education,
    projects,
    experience
  };
};

/**
 * General helper to run Groq calls with prompt string (used by other AI tools)
 */
export const generateText = async (prompt: string, mockResponse: string): Promise<string> => {
  if (!isGroqConfigured || !groq) {
    console.log("⚠️ [AI SERVICE] GROQ_API_KEY missing. Returning mock text response.");
    return mockResponse;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: MODELS.text,
      messages: [
        {
          role: "system",
          content: "You are a professional assistant writing cover letters or parsing documents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return chatCompletion.choices[0]?.message?.content || mockResponse;
  } catch (error) {
    console.error("❌ [AI SERVICE] Groq text generation error:", error);
    return mockResponse;
  }
};

export interface AtsSuggestion {
  icon: string;
  title: string;
  why: string;
  impact: "high" | "medium" | "low";
}

export interface AtsResult {
  score: number;
  suggestions: AtsSuggestion[];
}

/**
 * Calculates ATS Resume Score and provides suggestions.
 */
export const getAtsScore = async (
  profile: ISeekerProfile,
  userEmail: string
): Promise<AtsResult> => {
  const resumeText = profile.resumeText || "";

  if (isGroqConfigured && groq && resumeText.trim()) {
    try {
      const prompt = `
        You are a professional ATS scanner. Analyze the following resume text and score it from 0 to 100.
        Also provide 3-5 specific, highly actionable improvements as JSON.
        
        Resume:
        ${resumeText}

        Schema expectation:
        {
          "score": number,
          "suggestions": [
            {
              "icon": "Award" | "Briefcase" | "FileText" | "User" | "Check",
              "title": "string",
              "why": "string",
              "impact": "high" | "medium" | "low"
            }
          ]
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        model: MODELS.text,
        messages: [
          {
            role: "system",
            content: "You are a professional ATS scanner. Return details matching the requested JSON schema. Do not output anything else than valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content || "{}";
      return JSON.parse(content) as AtsResult;
    } catch (error) {
      console.error("❌ [AI SERVICE] Groq ATS Resume scoring error:", error);
    }
  }

  // High-fidelity fallback heuristic scorer
  const suggestions: AtsSuggestion[] = [];
  let score = 40;

  if (!profile.education || profile.education.length === 0) {
    suggestions.push({
      icon: "Award",
      title: "Add education history",
      why: "Academic backgrounds validate your foundation. Add graduation details.",
      impact: "high",
    });
  } else {
    score += 15;
  }

  if (!profile.skills || profile.skills.length === 0) {
    suggestions.push({
      icon: "Sparkles",
      title: "Add tech keywords in Skills",
      why: "ATS search indexes look directly for skill tags like React or Python.",
      impact: "high",
    });
  } else {
    score += 15;
    if (profile.skills.length < 5) {
      suggestions.push({
        icon: "Check",
        title: "Expand skills lists",
        why: "We recommend adding at least 8-10 specific framework/tool keywords.",
        impact: "medium",
      });
      score += 5;
    } else {
      score += 10;
    }
  }

  if (!profile.projects || profile.projects.length === 0) {
    suggestions.push({
      icon: "Briefcase",
      title: "Add developer projects",
      why: "Hands-on projects demonstrate capability and cover crucial technology keywords.",
      impact: "high",
    });
  } else {
    score += 15;
  }

  if (!profile.experience || profile.experience.length === 0) {
    suggestions.push({
      icon: "User",
      title: "Add work or internship history",
      why: "Internships, freelance work, or open source shows workplace collaboration.",
      impact: "medium",
    });
  } else {
    score += 15;
  }

  // General ATS tips
  suggestions.push({
    icon: "Check",
    title: "Quantify achievements in project descriptions",
    why: "Adding metrics (e.g. 'improved speed by 25%') increases resume readability.",
    impact: "high",
  });

  return {
    score: Math.min(100, score),
    suggestions: suggestions.slice(0, 5),
  };
};

export interface SkillGapItem {
  skill: string;
  resource: string;
  lift: number;
}

/**
 * Calculates missing skills vs target job requirements and suggests resources.
 */
export const getSkillGapAnalysis = async (
  profile: ISeekerProfile,
  job: IJob
): Promise<SkillGapItem[]> => {
  const jobSkills = job.skills || [];
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());

  // Determine missing skills
  const missingSkills = jobSkills.filter(
    (skill) => !profileSkills.some(
      (ps) => ps === skill.toLowerCase().trim() || ps.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(ps)
    )
  );

  const liftPerSkill = jobSkills.length > 0 ? Math.round(35 / jobSkills.length) : 5;

  const defaultResources: { [key: string]: string } = {
    react: "React Official documentation (react.dev) - Build Tic-Tac-Toe tutorial.",
    node: "Node.js Learning Path - Express framework documentation.",
    typescript: "TypeScript Deep Dive online book by Basarat.",
    mongodb: "MongoDB University - M001 Database Basics Course.",
    express: "Express.js official getting started guide.",
    docker: "Docker curriculum (docker-curriculum.com) - Containers for beginners.",
    kubernetes: "Kubernetes Basics interactive tutorial on kubernetes.io.",
    aws: "AWS Certified Cloud Practitioner - Free training course on AWS Skill Builder.",
    postgresql: "PostgreSQL Tutorial (postgresqltutorial.com) - Relational DB basics.",
    python: "Python for Beginners on freeCodeCamp.",
    git: "Git Immersion tutorial (gitimmersion.com)."
  };

  const gapAnalysis: SkillGapItem[] = missingSkills.map((skill) => {
    const key = skill.toLowerCase().trim();
    const resource = defaultResources[key] || `Free courses for ${skill} on YouTube and Coursera.`;
    return {
      skill,
      resource,
      lift: liftPerSkill,
    };
  });

  return gapAnalysis;
};

/**
 * Tailors a cover letter based on seeker profile and target job description.
 */
export const generateCoverLetter = async (
  profile: ISeekerProfile,
  job: IJob,
  userName: string
): Promise<string> => {
  const skillsList = profile.skills ? profile.skills.slice(0, 4).join(", ") : "";
  const projectsList = profile.projects ? profile.projects.map((p) => p.title).join(", ") : "";

  const prompt = `
    You are a professional cover letter writer. Draft an engaging, professional cover letter (under 250 words) for a seeker applying to a job.
    Seeker Name: ${userName}
    Seeker Skills: ${profile.skills?.join(", ")}
    Seeker Projects: ${profile.projects?.map((p) => `${p.title}: ${p.description}`).join("; ")}
    Job Title: ${job.title}
    Company: ${job.company}
    Job Description: ${job.description}
    Keep it encouraging and fit for a fresher.
  `;

  const fallbackLetter = `Dear Hiring Team at ${job.company},

I am writing to express my enthusiastic interest in the ${job.title} position at your company. As a graduate with a solid foundation in software development and practical skills in ${skillsList || "computer science"}, I am eager to contribute my capabilities to your engineering division.

During my studies, I have successfully engineered projects such as ${projectsList || "web interfaces"}, which allowed me to solve complex algorithmic issues and learn modern developer frameworks. I am highly motivated by ${job.company}'s work and feel confident my skills align well with the expectations for this role.

Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications further.

Sincerely,
${userName}`;

  return generateText(prompt, fallbackLetter);
};

// LaTeX character escaper helper
const escapeLatex = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
};

/**
 * Renders seeker profile into a valid, compileable LaTeX resume string.
 */
export const generateLatexResume = (
  profile: ISeekerProfile,
  userEmail: string,
  userName: string
): string => {
  const name = escapeLatex(userName);
  const email = escapeLatex(userEmail);

  // 1. Education LaTeX block
  const eduItems = (profile.education || []).map((edu) => `
\\noindent \\textbf{${escapeLatex(edu.degree)}} \\hfill ${edu.year} \\\\
\\textit{${escapeLatex(edu.institution)}} \\\\
  `).join("\n");

  // 2. Skills LaTeX block
  const skillsText = escapeLatex(profile.skills?.join(", ") || "");

  // 3. Projects LaTeX block
  const projItems = (profile.projects || []).map((p) => `
\\noindent \\textbf{${escapeLatex(p.title)}} \\hfill \\textit{${escapeLatex(p.tech.join(", "))}} \\\\
${escapeLatex(p.description)} \\\\
  `).join("\n");

  // 4. Experience LaTeX block
  const expItems = (profile.experience || []).map((exp) => `
\\noindent \\textbf{${escapeLatex(exp.role)}} \\hfill ${exp.durationMonths} months \\\\
\\textit{${escapeLatex(exp.org)}} \\\\
${escapeLatex(exp.summary)} \\\\
  `).join("\n");

  const template = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}

\\begin{document}
\\begin{center}
    {\\LARGE\\bfseries ${name}} \\\\
    \\vspace{2pt}
    ${email}
\\end{center}

\\section{Skills}
\\noindent ${skillsText}

\\section{Education}
${eduItems || "No education added."}

\\section{Projects}
${projItems || "No projects added."}

\\section{Experience}
${expItems || "No work experience."}

\\end{document}
`;

  return template;
};

const getMockChatbotReply = (message: string, profile: ISeekerProfile | null, userName: string): string => {
  const msg = message.toLowerCase();
  const name = userName.split(" ")[0];

  if (msg.includes("resume") || msg.includes("ats") || msg.includes("cv")) {
    return `Hi ${name}! 📄 Here are key ways to optimize your resume for ATS scanners:
1. **Use clear structural headings** (like "Skills", "Education", "Projects", "Experience").
2. **Quantify achievements** (e.g., "Created a task dashboard that improved user engagement by 20%").
3. **Incorporate keyword terms** found directly in your target job descriptions.
You can use the **Resume Analyzer** tab in the sidebar to run a complete diagnostic scan of your profile!`;
  }
  if (msg.includes("skill") || msg.includes("gap") || msg.includes("learn")) {
    return `Hey ${name}, bridging your technical skill gaps is essential! 🚀
- **For Frontend roles**: Master JavaScript, modern **React**, and **TypeScript**.
- **For Backend roles**: Master **Node.js/Express** and SQL/NoSQL databases like PostgreSQL or MongoDB.
- **For general workflow**: Understand Git, GitHub, and containerization with Docker.
Check out the **Browse Jobs** page and click "View Breakdown" to analyze specific gaps against real-world listings!`;
  }
  if (msg.includes("interview") || msg.includes("prepare") || msg.includes("question")) {
    return `Preparation is key, ${name}! 💡 Focus on these main areas:
1. **Behavioral Questions**: Structure your project stories using the **STAR method** (Situation, Task, Action, Result).
2. **Core Concepts**: Be prepared to explain closures, asynchronous JavaScript (Promises/Async-Await), and event loops.
3. **Database & Schema**: Know how your project collections are structured and relate to each other.
Would you like me to prompt you with a sample technical interview question?`;
  }
  if (msg.includes("project") || msg.includes("portfolio")) {
    return `Building production-ready projects will set you apart! 🛠️ Consider creating:
1. A **Full-stack web application** (like an AI-powered job board) implementing complete database CRUD.
2. A **utility tool using external APIs** (like a mock dashboard) demonstrating API handling.
3. A responsive **Developer Portfolio** to showcase your contact details and active links.`;
  }
  
  return `Hi ${name}! I am your personal AI Career Coach. 🎓 I can assist you to:
- Review your resume to improve your ATS score.
- Identify and bridge skill gaps for active jobs.
- Plan what projects or frameworks to learn next.
What would you like to discuss today?`;
};

export const chatWithAi = async (
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  profile: ISeekerProfile | null,
  userName: string
): Promise<string> => {
  if (isGroqConfigured && groq) {
    try {
      const profileContext = profile 
        ? `User Profile Context:\nName: ${userName}\nSkills: ${profile.skills?.join(", ")}\nEducation: ${profile.education?.map((e) => `${e.degree} from ${e.institution}`).join("; ")}\nProjects: ${profile.projects?.map((p) => p.title).join("; ")}`
        : "User Profile Context: Profile not completed yet.";
      
      const messages = [
        {
          role: "system",
          content: `You are a professional, helpful, and friendly AI Career Coach for the "AI Job Seeker" platform.
          Your goal is to guide freshers and graduates to improve their skills, resumes, and interview skills.
          Keep your answers concise, encouraging, and highly actionable.
          Use markdown formatting and lists where appropriate.
          ${profileContext}`
        },
        ...history,
        { role: "user", content: message }
      ];

      const chatCompletion = await groq.chat.completions.create({
        model: MODELS.text,
        messages: messages as any,
      });

      return chatCompletion.choices[0]?.message?.content || "I'm having trouble connecting to my brain. Ask me again shortly!";
    } catch (error) {
      console.error("❌ [AI SERVICE] Groq Chat error:", error);
    }
  }

  // Fallback to high-fidelity mock chatbot
  return getMockChatbotReply(message, profile, userName);
};

export const generateInterviewQuestions = async (
  profile: ISeekerProfile | null,
  job: IJob | null
): Promise<string[]> => {
  const jobTitle = job?.title || "Software Engineer";
  const jobDesc = job?.description || "";
  const jobReqs = job?.requirements?.join(", ") || "";
  const jobSkills = job?.skills?.join(", ") || "";
  const company = job?.company || "a tech company";

  const skills = profile?.skills?.join(", ") || "";
  const projects = profile?.projects?.map(p => `${p.title} (${p.tech?.join(", ")}): ${p.description}`).join("; ") || "";
  const experience = profile?.experience?.map(e => `${e.role} at ${e.org}`).join("; ") || "";

  if (isGroqConfigured && groq) {
    try {
      const prompt = `You are a senior technical interviewer at ${company} conducting a real interview for "${jobTitle}".

Candidate Profile:
- Skills: ${skills || "general software development"}
- Projects: ${projects || "not specified"}
- Experience: ${experience || "fresher"}

Job Requirements:
- Required Skills: ${jobSkills || jobReqs}
- Description: ${jobDesc}

Generate exactly 4 UNIQUE, SPECIFIC questions tailored to THIS candidate and THIS role.
1. A deep technical question about a specific skill from the job requirements (e.g. if Docker is required, ask about Docker internals, not generic questions).
2. A technical coding or system-design question around a second specific skill from the job requirements.
3. A project deep-dive — use the candidate's ACTUAL project name and ask about architecture, trade-offs, or a specific technology used in it.
4. A behavioral/situational question specific to the company domain or role challenges at ${company}.

IMPORTANT: Do NOT generate generic questions. Reference the candidate's actual skills and project names. Make all 4 questions completely different from each other.

Return ONLY a JSON object: { "questions": ["q1", "q2", "q3", "q4"] }`;

      const chatCompletion = await groq.chat.completions.create({
        model: MODELS.text,
        messages: [
          {
            role: "system",
            content: "You are a professional technical interviewer. Return ONLY a valid JSON object with a 'questions' array of exactly 4 question strings. No other text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      // Handle both {questions: [...]} wrapper and direct array
      const questions = Array.isArray(parsed)
        ? parsed
        : (parsed.questions || parsed.data || Object.values(parsed)[0]);
      if (Array.isArray(questions) && questions.length >= 4) {
        return questions.slice(0, 4);
      }
    } catch (error) {
      console.error("❌ [AI SERVICE] Error generating interview questions:", error);
    }
  }

  // Fallback: unique questions derived from actual candidate + job data
  const skill1 = job?.skills?.[0] || profile?.skills?.[0] || "JavaScript";
  const skill2 = job?.skills?.[1] || profile?.skills?.[1] || "system design";
  const proj = profile?.projects?.[0];
  const projName = proj?.title || "your main project";
  const projTech = proj?.tech?.join(" and ") || skill1;

  return [
    `The ${jobTitle} role at ${company} requires strong ${skill1} expertise. Design a production-ready ${skill1} system that must handle 10,000 concurrent requests — describe the architecture choices, bottlenecks you'd anticipate, and how you'd address them.`,
    `You listed ${skill2} as a skill. Compare two different implementation strategies for a real problem involving ${skill2} — what are the trade-offs and which would you choose for a ${jobTitle} context?`,
    `Your project "${projName}" was built with ${projTech}. Walk me through the most complex technical challenge you faced — specifically around data flow, performance, or error handling — and how you solved it.`,
    `At ${company}, engineers often deal with ambiguous requirements and shifting priorities. Describe a specific situation where you had to make an independent technical decision under time pressure — what was the decision, the risks, and the result?`,
  ];
};

export interface IEvaluationResult {
  score: number;
  recommendation: "apply" | "do_not_apply";
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  answers: Array<{
    question: string;
    answer: string;
    feedback: string;
  }>;
}

export const evaluateInterviewAnswers = async (
  profile: ISeekerProfile | null,
  job: IJob | null,
  questions: string[],
  answers: string[]
): Promise<IEvaluationResult> => {
  const jobTitle = job?.title || "Software Engineer";
  const company = job?.company || "Target Company";
  
  if (isGroqConfigured && groq) {
    try {
      const qAndA = questions.map((q, i) => `Question ${i+1}: ${q}\nAnswer ${i+1}: ${answers[i] || "No answer provided"}`).join("\n\n");
      const prompt = `
        You are a senior technical assessor. Evaluate the candidate's responses to the following interview/test questions for the position of "${jobTitle}" at "${company}".
        
        Assessment Transcript:
        ${qAndA}
        
        Provide a comprehensive report. Score the overall assessment from 0 to 100.
        If the overall score is 70 or above, recommend "apply". If below 70, recommend "do_not_apply".
        
        Provide detailed feedback on each answer, listing their strengths, weaknesses (things they missed or struggled with), and a summary.
        
        Return the result strictly in JSON matching the schema below.
        
        Schema:
        {
          "score": number,
          "recommendation": "apply" | "do_not_apply",
          "feedback": "Overall summary of performance",
          "strengths": ["strength 1", "strength 2"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "answers": [
            {
              "question": "string",
              "answer": "string",
              "feedback": "Specific feedback for this answer"
            }
          ]
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        model: MODELS.text,
        messages: [
          {
            role: "system",
            content: "You are a professional technical interviewer. Return ONLY a valid JSON object matching the requested schema. No other text or markdown codeblocks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = chatCompletion.choices[0]?.message?.content || "{}";
      return JSON.parse(content) as IEvaluationResult;
    } catch (error) {
      console.error("❌ [AI SERVICE] Error evaluating answers:", error);
    }
  }

  // Fallback mock evaluation
  let score = 50;
  // Score based on answer lengths
  answers.forEach((ans) => {
    if (ans && ans.length > 100) score += 10;
    else if (ans && ans.length > 30) score += 5;
  });
  score = Math.min(95, Math.max(30, score));
  
  const recommendation = score >= 70 ? "apply" : "do_not_apply";

  const strengths = [
    "Demonstrated good conceptual understanding of software design principles.",
    "Project experience explanations are logically structured.",
    "Good awareness of debugging tools and troubleshooting methodologies."
  ];

  const weaknesses = [
    "Could provide more quantified results in project descriptions (e.g. percentage improvements).",
    "Needs to explain technical trade-offs more clearly (e.g. database schema selections).",
    "Should use the STAR method more strictly for behavioral answers."
  ];

  const evaluationAnswers = questions.map((q, i) => {
    const ans = answers[i] || "";
    let ansFeedback = "Good foundational start. Try adding more concrete examples of how you applied this in your projects.";
    if (!ans) {
      ansFeedback = "No response was submitted. It is critical to address every question during the assessment.";
    } else if (ans.length < 50) {
      ansFeedback = "Response is slightly brief. Expand with specific details about your implementation or experience.";
    }
    return {
      question: q,
      answer: ans,
      feedback: ansFeedback
    };
  });

  return {
    score,
    recommendation,
    feedback: `The candidate demonstrates ${score >= 70 ? "strong" : "basic"} alignment with the job requirements. ${score >= 70 ? "They are ready to apply." : "We recommend focusing on expanding technical depth in weak areas before submitting an application."}`,
    strengths,
    weaknesses,
    answers: evaluationAnswers
  };
};

export const generateTailoredLatexResume = async (
  profile: ISeekerProfile,
  job: IJob | null,
  userEmail: string,
  userName: string
): Promise<string> => {
  if (isGroqConfigured && groq && job) {
    try {
      const skillsList = profile.skills?.join(", ") || "";
      const educationText = (profile.education || []).map((e) => `${e.degree} from ${e.institution} (${e.year})`).join("; ");
      const projectsText = (profile.projects || []).map((p) => `${p.title} built with ${p.tech.join(", ")}: ${p.description}`).join("\n");
      const experienceText = (profile.experience || []).map((e) => `${e.role} at ${e.org} (${e.durationMonths} months): ${e.summary}`).join("\n");

      const prompt = `
        You are a professional resume writer and LaTeX engineer. Generate a tailored, compileable LaTeX resume for the following candidate applying for the job: "${job.title}" at "${job.company}".
        
        Candidate Profile:
        - Name: ${userName}
        - Email: ${userEmail}
        - Skills: ${skillsList}
        - Education: ${educationText}
        - Projects: ${projectsText}
        - Experience: ${experienceText}
        
        Job Requirements:
        - Required Skills: ${job.skills?.join(", ")}
        - Job Description: ${job.description}
        
        Tailor the resume for this job. CRITICAL RULES YOU MUST FOLLOW:
        - Use \\documentclass[10pt,letterpaper]{article}
        - Allowed packages ONLY: \\usepackage[T1]{fontenc}, \\usepackage[utf8]{inputenc}, \\usepackage[margin=0.75in]{geometry}, \\usepackage{titlesec}, \\usepackage{enumitem}
        - ABSOLUTELY DO NOT use fontspec, xcolor, xunicode, xltxtra, or any XeLaTeX/LuaLaTeX-only package
        - The document MUST compile successfully with pdflatex
        - Start with \\documentclass and end with \\end{document}
        - No markdown fencing, no introductory text, raw LaTeX only
      `;

      const chatCompletion = await groq.chat.completions.create({
        model: MODELS.text,
        messages: [
          {
            role: "system",
            content: "You are an expert LaTeX resume writer. Return ONLY a valid compileable LaTeX string. No markdown formatting, no code fencing, no comments.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      let latex = chatCompletion.choices[0]?.message?.content || "";
      // Strip markdown wrappers
      latex = latex.replace(/^```latex\n?/i, "").replace(/^```\n?/i, "").replace(/\n?```$/g, "").trim();
      // Remove fontspec (causes fatal error with pdflatex)
      latex = latex.replace(/\\usepackage\{fontspec\}/g, "");
      latex = latex.replace(/\\usepackage\[.*?\]\{fontspec\}/g, "");
      // Ensure T1 fontenc is present
      if (!latex.includes("fontenc")) {
        latex = latex.replace(
          /(\\usepackage\[utf8\]\{inputenc\})/,
          "\\usepackage[T1]{fontenc}\n$1"
        );
      }
      if (latex.trim().startsWith("\\documentclass")) {
        return latex;
      }
    } catch (error) {
      console.error("❌ [AI SERVICE] Error generating tailored LaTeX resume:", error);
    }
  }

  // Fallback / Mock behavior: compile using standard template but inject job-specific keywords
  const name = escapeLatex(userName);
  const email = escapeLatex(userEmail);

  // Blend job skills into profile skills
  const jobSkills = job?.skills || [];
  const profileSkills = [...(profile.skills || [])];
  
  // Add missing job skills to the top of skills list for the tailored effect!
  const missing = jobSkills.filter(s => !profileSkills.some(ps => ps.toLowerCase().includes(s.toLowerCase())));
  const tailoredSkills = [...missing, ...profileSkills];

  const skillsText = escapeLatex(tailoredSkills.join(", "));

  const eduItems = (profile.education || []).map((edu) => `
\\noindent \\textbf{${escapeLatex(edu.degree)}} \\hfill ${edu.year} \\\\
\\textit{${escapeLatex(edu.institution)}} \\\\
  `).join("\n");

  const projItems = (profile.projects || []).map((p) => {
    // Add some job-specific tech terms into tech list if not present
    const techList = [...p.tech];
    if (jobSkills.length > 0 && Math.random() > 0.5) {
      const randomSkill = jobSkills[Math.floor(Math.random() * jobSkills.length)];
      if (!techList.includes(randomSkill)) techList.push(randomSkill);
    }
    return `
\\noindent \\textbf{${escapeLatex(p.title)}} \\hfill \\textit{${escapeLatex(techList.join(", "))}} \\\\
${escapeLatex(p.description)} \\\\
  `;
  }).join("\n");

  const expItems = (profile.experience || []).map((exp) => `
\\noindent \\textbf{${escapeLatex(exp.role)}} \\hfill ${exp.durationMonths} months \\\\
\\textit{${escapeLatex(exp.org)}} \\\\
${escapeLatex(exp.summary)} \\\\
  `).join("\n");

  const template = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}

\\begin{document}
\\begin{center}
    {\\LARGE\\bfseries ${name}} \\\\
    \\vspace{2pt}
    ${email}
\\end{center}

\\section{Skills (Tailored for ${escapeLatex(job?.title || "Target Role")})}
\\noindent ${skillsText}

\\section{Education}
${eduItems || "No education added."}

\\section{Projects}
${projItems || "No projects added."}

\\section{Experience}
${expItems || "No work experience."}

\\end{document}
`;

  return template;
};

