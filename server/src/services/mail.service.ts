import nodemailer from "nodemailer";

export interface IMailReportData {
  seekerName: string;
  seekerEmail: string;
  jobTitle: string;
  company: string;
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

/**
 * Creates a Nodemailer transporter.
 * If SMTP credentials are provided in process.env, it uses them.
 * Otherwise, it creates a dynamic test account via Ethereal.email.
 */
const getTransporter = async (): Promise<{ transporter: nodemailer.Transporter; isMock: boolean }> => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log("📧 [Mail Service] Configuring real SMTP transporter...");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
    return { transporter, isMock: false };
  }

  console.log("📧 [Mail Service] SMTP credentials missing. Registering dynamic Ethereal test account...");
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, isMock: true };
};

/**
 * Sends a technical test and mock interview report to the candidate.
 * Returns a preview URL if using Ethereal fallback.
 */
export const sendEvaluationReport = async (data: IMailReportData): Promise<string | null> => {
  try {
    const { transporter, isMock } = await getTransporter();

    const fromEmail = process.env.EMAIL_FROM || "noreply@aijobseeker.dev";

    const strengthsList = data.strengths.map((s) => `<li>${s}</li>`).join("");
    const weaknessesList = data.weaknesses.map((w) => `<li>${w}</li>`).join("");
    
    const qaItems = data.answers.map((qa, index) => `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #F8F9FA; border-left: 4px solid #6366F1; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">Question ${index + 1}: ${qa.question}</p>
        <p style="margin: 0 0 10px 0; font-style: italic; color: #4B5563;">" ${qa.answer || "No response provided."} "</p>
        <div style="font-size: 13px; color: #4F46E5; font-weight: 500;">
          <strong>AI Feedback:</strong> ${qa.feedback}
        </div>
      </div>
    `).join("");

    const recommendationText = data.recommendation === "apply" 
      ? `<span style="background-color: #D1FAE5; color: #065F46; padding: 6px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px;">RECOMMENDED: APPLY NOW</span>`
      : `<span style="background-color: #FEF3C7; color: #92400E; padding: 6px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px;">RECOMMENDED: FOCUS ON WEAKNESSES</span>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Assessment Evaluation Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border-top: 8px solid #6366F1;">
          
          <!-- Header -->
          <div style="padding: 30px; text-align: center; background-color: #111827; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">AI Job Seeker</h1>
            <p style="margin: 5px 0 0 0; color: #9CA3AF; font-size: 14px;">Technical Test & Mock Interview Report</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.5;">Hi <strong>${data.seekerName}</strong>,</p>
            <p style="margin: 0 0 30px 0; font-size: 15px; color: #4B5563; line-height: 1.5;">You recently completed a Mock Interview & Technical Test for the <strong>${data.jobTitle}</strong> position at <strong>${data.company || "Target Company"}</strong>. Here is your evaluation breakdown and suggested pathway forward:</p>
            
            <!-- Summary Card -->
            <div style="margin-bottom: 35px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 25px; text-align: center;">
              <div style="font-size: 12px; font-weight: bold; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Overall Assessment Score</div>
              <div style="font-size: 48px; font-weight: 800; color: #111827; line-height: 1; margin-bottom: 15px;">${data.score}<span style="font-size: 20px; font-weight: 500; color: #6B7280;">/100</span></div>
              <div style="margin-bottom: 20px;">${recommendationText}</div>
              <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.5; font-style: italic;">"${data.feedback}"</p>
            </div>

            <!-- Strengths & Weaknesses -->
            <div style="margin-bottom: 35px;">
              <h3 style="font-size: 16px; font-weight: bold; color: #111827; margin: 0 0 15px 0; border-bottom: 1px solid #F3F4F6; padding-bottom: 8px;">Key Strengths</h3>
              <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.6;">
                ${strengthsList || "<li>No major strengths highlighted. Keep practicing!</li>"}
              </ul>

              <h3 style="font-size: 16px; font-weight: bold; color: #111827; margin: 0 0 15px 0; border-bottom: 1px solid #F3F4F6; padding-bottom: 8px;">Areas to Improve (Weak Parts)</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.6;">
                ${weaknessesList || "<li>No major weaknesses highlighted. Excellent job!</li>"}
              </ul>
            </div>

            <!-- Q&A Transcript -->
            <div>
              <h3 style="font-size: 16px; font-weight: bold; color: #111827; margin: 0 0 20px 0; border-bottom: 1px solid #F3F4F6; padding-bottom: 8px;">Question-by-Question Review</h3>
              ${qaItems}
            </div>

          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; background-color: #F9FAFB; border-top: 1px solid #F3F4F6; text-align: center; font-size: 12px; color: #6B7280;">
            <p style="margin: 0 0 8px 0;">This email is a technical test report compiled by your AI Career Coach.</p>
            <p style="margin: 0;">&copy; 2026 AI Job Seeker. All rights reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"AI Job Seeker" <${fromEmail}>`,
      to: data.seekerEmail,
      subject: `[Report] ${data.jobTitle} Mock Interview Assessment`,
      html: htmlContent,
    });

    if (isMock) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 [Mail Service] Mock report sent successfully! Preview link: ${previewUrl}`);
      return previewUrl || null;
    }

    console.log(`📧 [Mail Service] Real report sent successfully to ${data.seekerEmail}`);
    return null;
  } catch (error) {
    console.error("❌ [Mail Service] Failed to send evaluation email:", error);
    return null;
  }
};
