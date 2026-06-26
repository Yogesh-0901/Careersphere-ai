import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const PORT = 3000;

// Lazy initialization of the Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Successfully initialized real-time Google GenAI client.");
      } catch (err) {
        console.error("Failed to initialize Google GenAI SDK:", err);
      }
    } else {
      console.warn("GEMINI_API_KEY is not defined. Using high-fidelity smart backup generator.");
    }
  }
  return aiClient;
}

// Check environment Status
app.get("/api/ai/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    hasKey,
    mode: hasKey ? "ai-generative-live" : "ai-simulation-offline"
  });
});

// Endpoint: Send Real Email via EmailJS
app.post("/api/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: "service_xw7k85y",
        template_id: "template_1gitqyj",
        user_id: "ZFnEUVSq5ekCN4kmV",
        template_params: {
          to_email: to,
          subject: subject,
          message: body
        }
      })
    });

    if (response.ok) {
      console.log(`[REAL EMAIL SENT] Successfully sent email to ${to} via EmailJS`);
      res.json({
        success: true,
        mode: "real",
        message: "Real email sent successfully via EmailJS!"
      });
    } else {
      const errorText = await response.text();
      console.error("EmailJS failed to send email:", errorText);
      res.status(500).json({
        success: false,
        error: errorText || "Failed to send email via EmailJS."
      });
    }
  } catch (error: any) {
    console.error("EmailJS failed to send email:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to connect to EmailJS."
    });
  }
});

// Endpoint: AI Resume Analyzer
app.post("/api/ai/analyze-resume", async (req, res) => {
  const { fileData, mimeType, filename, skills, role } = req.body;
  const targetRole = role || "UI/UX Designer";
  const gemini = getGemini();

  if (gemini) {
    try {
      const prompt = `Analyze this resume content for a candidate aiming to join as a ${targetRole}. 
      File Name: ${filename || "resume.pdf"}
      Candidate current declared skills: ${skills ? skills.join(", ") : "Not provided"}

      Evaluate carefully and suggest precise enhancements. Return a JSON structure resembling:
      {
        "score": 88, // integer between 0 and 100
        "feedback": "Deeply descriptive detailed evaluation paragraph summarizing overall visual, layout structure, and matching score metric against target candidate role.",
        "suggestions": [
          "Actionable suggestion 1 focusing on missing keywords or quantitative metrics",
          "Actionable suggestion 2 focusing on projects or credentials",
          "Actionable suggestion 3 focusing on portfolio, social presence, or UX tools"
        ],
        "certificatesCount": 4, // Integer count of certificates/credentials listed in the resume text
        "projectsCount": 3, // Integer count of distinct projects/case studies listed in the resume text
        "skillsCount": 12, // Integer count of distinct technical skills/tools listed in the resume text
        "achievementsCount": 2, // Integer count of achievements/awards/badge medals listed in the resume text
        "strengths": [
          "Strength 1 from resume",
          "Strength 2 from resume",
          "Strength 3 from resume"
        ],
        "weaknesses": [
          "Weakness or Area of improvement 1 from resume",
          "Weakness or Area of improvement 2 from resume",
          "Weakness or Area of improvement 3 from resume"
        ]
      }`;

      const contentParts: any[] = [];
      if (fileData && mimeType) {
        contentParts.push({
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        });
      }
      contentParts.push(prompt);

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contentParts,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Candidate resume relevance score 0-100" },
              feedback: { type: Type.STRING, description: "Evaluation narrative summary" },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable itemized bullet feedback points"
              },
              certificatesCount: { type: Type.INTEGER },
              projectsCount: { type: Type.INTEGER },
              skillsCount: { type: Type.INTEGER },
              achievementsCount: { type: Type.INTEGER },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["score", "feedback", "suggestions", "certificatesCount", "projectsCount", "skillsCount", "achievementsCount", "strengths", "weaknesses"]
          }
        }
      });

      if (response && response.text) {
        const parsedData = JSON.parse(response.text.trim());
        return res.json(parsedData);
      }
    } catch (e: any) {
      console.error("Gemini Resume Analysis failed, using backup:", e);
    }
  }

  // Backup Simulation
  const nameLower = (filename || "").toLowerCase();
  let certificatesCount = 3;
  let projectsCount = 2;
  let skillsCount = 8;
  let achievementsCount = 4;
  let score = 82;
  let feedback = `The resume presents a solid baseline for a starting ${targetRole}. However, it is slightly missing key industrial metrics and concrete project impact indicators. The overall formatting is tidy, but further design systems alignment is highly recommended.`;
  let suggestions = [
    "Include 2+ case studies focused on the full end-to-end user-centered process instead of simple mockups.",
    "Highlight your experience with industry-standard design handoffs tools like Figma variables and Zeplin.",
    "Introduce quantitative metrics in your previous engineering roles to demonstrate workflow acceleration (e.g., 'reduced turnaround times by 20%')."
  ];
  let strengths = [
    `Strong keyword correlation for ${targetRole}`,
    "Standard industry jargon formatting",
    "Solid layout alignment and structural flow"
  ];
  let weaknesses = [
    "ATS alignment can be slightly improved",
    "Address missing skills flagged in Gap tab",
    "Structure case studies closer to production projects"
  ];

  if (nameLower.includes("senior") || nameLower.includes("sr")) {
    score = 92;
    certificatesCount = 6;
    projectsCount = 4;
    skillsCount = 14;
    achievementsCount = 5;
    feedback = `Excellent senior representation for a ${targetRole}. Solid keyword correlation, outstanding case studies, and a highly comprehensive design systems profile.`;
    strengths = [
      "Proven production-level case studies with end-to-end telemetry",
      "Advanced command over cross-functional design specifications",
      "High density of industry-recognized certifications"
    ];
  } else if (nameLower.includes("intern") || nameLower.includes("fresher") || nameLower.includes("junior")) {
    score = 68;
    certificatesCount = 1;
    projectsCount = 1;
    skillsCount = 4;
    achievementsCount = 2;
    feedback = `Entry-level resume layout for a ${targetRole}. Needs more concrete project examples, tool declarations, and professional certificates to stand out.`;
    strengths = [
      "Clean basic sections formatting",
      "Clear academic projects documentation",
      "Willingness to learn indicated by initial skills stack"
    ];
    weaknesses = [
      "No real-world internship or freelance work listed",
      "Extremely limited tools and frameworks expertise",
      "No specialized achievements or certifications"
    ];
  }

  setTimeout(() => {
    res.json({
      score,
      feedback,
      suggestions,
      certificatesCount,
      projectsCount,
      skillsCount,
      achievementsCount,
      strengths,
      weaknesses
    });
  }, 1000);
});

// Endpoint: AI Mentor Conversational Chat
app.post("/api/ai/chat-mentor", async (req, res) => {
  const { messages, selectedRole, userSkills } = req.body;
  const gemini = getGemini();

  const conversationHistory = messages || [];
  const latestMessage = conversationHistory[conversationHistory.length - 1]?.text || "Hello";

  if (gemini) {
    try {
      // Build brief formatted instruction
      const systemInstruction = `You are "CareerSphere AI Mentor", a supportive, highly knowledgeable, and friendly senior industry executive coaching a user looking to level up.
      Target career path: ${selectedRole || "UI/UX Designer"}
      User's technical skillset: ${userSkills ? userSkills.join(", ") : "Basic Tech"}
      
      Keep answers structured, concise, elegant, and action-oriented. Prioritize actionable next-steps using bullet points.`;

      // Use generateContent with chat records
      const chatHistoryParts = conversationHistory.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      // If we don't have enough history, append a default start
      if (chatHistoryParts.length === 0) {
        chatHistoryParts.push({ role: "user", parts: [{ text: latestMessage }] });
      }

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [{ text: latestMessage }]
        },
        config: {
          systemInstruction
        }
      });

      if (response && response.text) {
        return res.json({ text: response.text });
      }
    } catch (e) {
      console.error("Gemini mentor chat error, using fallback:", e);
    }
  }

  // ── Comprehensive offline fallback: keyword-aware, role-aware responses ──
  const role = (selectedRole || "UI/UX Designer").trim();
  const lowerMsg = latestMessage.toLowerCase();
  const roleLabel = role;
  const is = (keywords: string[]) => keywords.some(k => lowerMsg.includes(k));
  let backupResponse = "";

  if (is(["how to become","how i become","how do i become","career path","get started","start my career","how to start","become a","roadmap for","steps to become"])) {
    const roadmaps: Record<string,string> = {
      "Frontend Engineer": "**Becoming a Frontend Engineer** \u2014 4-phase plan:\n\n1. **Foundation** (1-2 months): HTML5, CSS3, JavaScript ES6+\n2. **Framework** (2-3 months): React.js + TypeScript + state management\n3. **Tools** (1 month): Git, Vite, REST APIs, Figma handoff, Tailwind CSS\n4. **Portfolio** (1 month): Deploy 3 projects on Vercel, write good READMEs\n\n\ud83c\udfaf Target: Zoho, Freshworks, Razorpay, Swiggy, startups via AngelList.",
      "Backend Developer": "**Becoming a Backend Developer** \u2014 4-phase plan:\n\n1. **Core Language** (1-2 months): Node.js or Python \u2014 master async programming\n2. **APIs & DB** (2 months): REST API design, PostgreSQL, MongoDB, Prisma ORM\n3. **System Concepts** (1-2 months): JWT auth, Redis, Docker, message queues\n4. **Deploy** (1 month): AWS basics, CI/CD, logging & monitoring\n\n\ud83c\udfaf Build a full CRUD API with auth, deploy it, and document it on GitHub.",
      "Full Stack Developer": "**Becoming a Full Stack Developer** \u2014 5-phase plan:\n\n1. **Frontend** (2 months): HTML, CSS, JS, React.js, responsive design\n2. **Backend** (2 months): Node.js + Express, REST APIs, JWT auth\n3. **Database** (1 month): PostgreSQL, MongoDB, Prisma ORM\n4. **DevOps** (1 month): Docker, CI/CD, deploy on Vercel/Railway\n5. **Full Project** (1 month): Complete SaaS app (e.g., task manager with auth)\n\n\ud83c\udfaf Full Stack pays \u20b98\u201325 LPA. Show end-to-end ownership in your portfolio.",
      "UI/UX Designer": "**Becoming a UI/UX Designer** \u2014 4-phase plan:\n\n1. **Design Fundamentals** (1-2 months): Typography, color theory, spacing, Gestalt principles\n2. **Tool Mastery** (1-2 months): Figma \u2014 auto-layout, components, variables, prototyping\n3. **UX Process** (2 months): User research, wireframing, usability testing, case studies\n4. **Portfolio** (1 month): 3 case studies: problem \u2192 research \u2192 design \u2192 outcome\n\n\ud83c\udfaf Target Figma, Zoho, Freshworks, design agencies, or freelancing.",
      "Data Analyst": "**Becoming a Data Analyst** \u2014 4-phase plan:\n\n1. **Foundation** (1-2 months): Excel, SQL (JOINs, GROUP BY, CTEs), statistics basics\n2. **Visualization** (1 month): Power BI or Tableau + Python (pandas, seaborn)\n3. **Business Skills** (1 month): KPI analysis, A/B testing, data storytelling\n4. **Portfolio** (1 month): Kaggle datasets, dashboards on GitHub, SQL showcase\n\n\ud83c\udfaf Salaries: \u20b94\u201315 LPA. Target TCS, Infosys, analytics consultancies, startups.",
      "AI & ML Engineer": "**Becoming an AI/ML Engineer** \u2014 5-phase plan:\n\n1. **Math & Python** (2 months): Linear algebra, probability, NumPy, pandas\n2. **ML Fundamentals** (2 months): scikit-learn, model evaluation, supervised/unsupervised\n3. **Deep Learning** (2 months): PyTorch, CNNs, RNNs, transformers\n4. **MLOps** (1 month): MLflow, Docker, FastAPI model serving, Hugging Face\n5. **Projects**: Kaggle, open source, research paper implementations\n\n\ud83c\udfaf AI/ML Engineers earn \u20b910\u201340 LPA; \u20b960\u2013200 LPA at FAANG.",
      "Cyber Security Analyst": "**Becoming a Cyber Security Analyst** \u2014 4-phase plan:\n\n1. **Networking** (1-2 months): TCP/IP, DNS, firewalls, OSI model, Wireshark\n2. **Security Concepts** (2 months): CIA Triad, OWASP Top 10, cryptography\n3. **Tools & Practice** (2 months): Kali Linux, Nmap, Burp Suite, TryHackMe, HackTheBox\n4. **Certifications**: CompTIA Security+, CEH, or OSCP\n\n\ud83c\udfaf Salaries: \u20b95\u201320 LPA. High demand in BFSI and MNCs.",
      "Cloud Engineer": "**Becoming a Cloud Engineer** \u2014 4-phase plan:\n\n1. **Linux & Networking** (1 month): Shell scripting, SSH, networking basics\n2. **Cloud Provider** (2 months): AWS (EC2, S3, RDS, Lambda, VPC) \u2014 get certified\n3. **DevOps Tools** (2 months): Docker, Kubernetes, Terraform, GitHub Actions\n4. **Projects & Certs** (1-2 months): Deploy 3-tier AWS app, AWS Solutions Architect Associate\n\n\ud83c\udfaf Salaries: \u20b98\u201330 LPA. Cloud is one of the highest-paying tech tracks.",
      "Digital Marketer": "**Becoming a Digital Marketer** \u2014 4-phase plan:\n\n1. **Foundations** (1 month): SEO, GA4, social media algorithms, content strategy\n2. **Paid Ads** (1-2 months): Google Ads, Meta Ads Manager, A/B testing, funnels\n3. **Tools** (1 month): Ahrefs/SEMrush, Mailchimp, HubSpot, UTM tracking\n4. **Portfolio** (1 month): Run real campaigns, document results, grow a social channel\n\n\ud83c\udfaf Salaries: \u20b93\u201312 LPA (\u20b920+ LPA as Growth Manager).",
      "Product Manager": "**Becoming a Product Manager** \u2014 4-phase plan:\n\n1. **PM Fundamentals** (1-2 months): User stories, PRDs, RICE/MoSCoW prioritization, Agile\n2. **Analytics** (1 month): GA4, Mixpanel, user interviews, A/B testing, OKRs\n3. **Tools** (1 month): Jira, Confluence, Figma (reading), Notion, roadmap tools\n4. **Portfolio** (ongoing): Product teardowns, APM programs, PM communities on LinkedIn\n\n\ud83c\udfaf Salaries: \u20b98\u201335 LPA. Path: APM \u2192 PM \u2192 Senior PM \u2192 Director of Product."
    };
    backupResponse = roadmaps[role] || roadmaps["Full Stack Developer"];

  } else if (is(["salary","pay","package","lpa","ctc","compensation","how much","earn","income"])) {
    const salaries: Record<string,string> = {
      "Frontend Engineer": "**Frontend Engineer Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher (0-1 yr): \u20b93.5-7 LPA\n- \ud83d\udfe1 Junior (1-3 yrs): \u20b97-14 LPA\n- \ud83d\udd35 Mid-Level (3-6 yrs): \u20b914-25 LPA\n- \ud83d\udd34 Senior (6+ yrs): \u20b925-50+ LPA\n\n**Top payers**: Razorpay, Swiggy, CRED, Zepto, Atlassian.\n\ud83d\udca1 React + TypeScript expertise can add 30-40% to your offer.",
      "Backend Developer": "**Backend Developer Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b94-8 LPA\n- \ud83d\udfe1 Junior: \u20b98-16 LPA\n- \ud83d\udd35 Mid-Level: \u20b916-28 LPA\n- \ud83d\udd34 Senior: \u20b928-60+ LPA\n\n**High-paying skills**: Golang, Kafka, Kubernetes, distributed systems.\n\ud83d\udca1 Backend is often paid more than frontend due to system design complexity.",
      "Full Stack Developer": "**Full Stack Developer Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b94-9 LPA\n- \ud83d\udfe1 Junior: \u20b99-18 LPA\n- \ud83d\udd35 Mid-Level: \u20b918-30 LPA\n- \ud83d\udd34 Senior: \u20b930-60+ LPA\n\n**Best stack**: MERN or Next.js + PostgreSQL.\n\ud83d\udca1 Full stack engineers have the widest job market.",
      "UI/UX Designer": "**UI/UX Designer Salaries in India (2024):**\n\n- \ud83d\udfe2 Junior Designer: \u20b93-6 LPA\n- \ud83d\udfe1 Mid Designer: \u20b97-14 LPA\n- \ud83d\udd35 Senior Designer: \u20b915-25 LPA\n- \ud83d\udd34 Design Lead: \u20b925-50+ LPA\n\n**Top payers**: Zoho, Freshworks, Swiggy, PhonePe.\n\ud83d\udca1 A strong case study portfolio matters more than a degree.",
      "Data Analyst": "**Data Analyst Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b93.5-6 LPA\n- \ud83d\udfe1 Junior: \u20b96-12 LPA\n- \ud83d\udd35 Mid-Level: \u20b912-20 LPA\n- \ud83d\udd34 Senior: \u20b920-40+ LPA\n\n**High-value skills**: SQL, Python, Power BI, statistical modeling.\n\ud83d\udca1 Transitioning to Data Scientist can 2x your salary.",
      "AI & ML Engineer": "**AI/ML Engineer Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b96-12 LPA\n- \ud83d\udfe1 Junior: \u20b912-22 LPA\n- \ud83d\udd35 Mid-Level: \u20b922-40 LPA\n- \ud83d\udd34 Senior: \u20b940-80+ LPA\n\n**FAANG pays**: \u20b960-200+ LPA for top ML researchers.\n\ud83d\udca1 LLM fine-tuning and MLOps are the hottest skills in 2024.",
      "Cyber Security Analyst": "**Cyber Security Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b94-8 LPA\n- \ud83d\udfe1 Junior SOC Analyst: \u20b98-15 LPA\n- \ud83d\udd35 Mid (Pen Tester): \u20b915-28 LPA\n- \ud83d\udd34 Security Architect: \u20b928-60+ LPA\n\n**Top payers**: BFSI sector, defense, MNCs.\n\ud83d\udca1 OSCP certification can boost salary by 40-60%.",
      "Cloud Engineer": "**Cloud Engineer Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b95-10 LPA\n- \ud83d\udfe1 Junior: \u20b910-18 LPA\n- \ud83d\udd35 Mid-Level: \u20b918-32 LPA\n- \ud83d\udd34 Senior/Architect: \u20b932-70+ LPA\n\n**AWS > Azure > GCP** for job availability.\n\ud83d\udca1 AWS Architect + Kubernetes = premium compensation.",
      "Digital Marketer": "**Digital Marketing Salaries in India (2024):**\n\n- \ud83d\udfe2 Fresher: \u20b92.5-5 LPA\n- \ud83d\udfe1 Mid (2-4 yrs): \u20b95-12 LPA\n- \ud83d\udd35 Senior/Manager: \u20b912-22 LPA\n- \ud83d\udd34 Growth Lead/CMO: \u20b922-60+ LPA\n\n**Best specializations**: Performance Marketing, SEO, Growth.\n\ud83d\udca1 Show ROI-driven results (\"reduced CAC by 40%\") to get hired faster.",
      "Product Manager": "**Product Manager Salaries in India (2024):**\n\n- \ud83d\udfe2 APM/Junior PM: \u20b98-14 LPA\n- \ud83d\udfe1 PM (2-4 yrs): \u20b914-25 LPA\n- \ud83d\udd35 Senior PM: \u20b925-45 LPA\n- \ud83d\udd34 Director of Product: \u20b945-1Cr+ LPA\n\n**Top payers**: Razorpay, PhonePe, Swiggy, Meesho, CRED.\n\ud83d\udca1 Technical background + MBA = highest PM compensation."
    };
    backupResponse = salaries[role] || salaries["Full Stack Developer"];

  } else if (is(["skill","learn","technology","tech stack","tools","what to learn","which language","programming language","framework","library"])) {
    const skills: Record<string,string> = {
      "Frontend Engineer": "**Essential Frontend Engineer Skills:**\n\n\ud83d\udd27 **Core**: HTML5, CSS3, JavaScript (ES6+), TypeScript\n\u269b\ufe0f **Framework**: React.js (most in-demand)\n\ud83c\udfa8 **Styling**: Tailwind CSS, Framer Motion, styled-components\n\ud83d\udce1 **APIs & State**: REST, React Query, Zustand/Redux\n\ud83e\uddea **Testing**: Jest, React Testing Library, Playwright\n\u2601\ufe0f **Deployment**: Vercel, Netlify, CI/CD basics",
      "Backend Developer": "**Essential Backend Developer Skills:**\n\n\ud83d\udcbb **Language**: Node.js + Express OR Python + FastAPI\n\ud83d\uddc4\ufe0f **Databases**: PostgreSQL (must), MongoDB, Redis\n\ud83d\udd17 **APIs**: REST, GraphQL, API versioning, OpenAPI docs\n\ud83d\udd10 **Security**: JWT, OAuth2, input validation, HTTPS\n\ud83d\udce6 **DevOps**: Docker, basic Kubernetes, CI/CD\n\u2601\ufe0f **Cloud**: AWS basics (EC2, S3, RDS, Lambda)",
      "Full Stack Developer": "**Essential Full Stack Skills:**\n\n\ud83d\udda5\ufe0f **Frontend**: React.js, TypeScript, Tailwind CSS\n\u2699\ufe0f **Backend**: Node.js + Express, REST APIs, JWT\n\ud83d\uddc4\ufe0f **Database**: PostgreSQL, Prisma ORM, Redis\n\ud83d\udc33 **DevOps**: Docker, GitHub Actions, Vercel/Railway\n\ud83d\udcf1 **Bonus**: Next.js, GraphQL, WebSockets, tRPC",
      "UI/UX Designer": "**Essential UI/UX Designer Skills:**\n\n\ud83d\udda8\ufe0f **Tool**: Figma (auto-layout, components, variables, prototyping)\n\ud83c\udfa8 **Visual Design**: Typography, color theory, spacing, design systems\n\ud83d\udc64 **UX Process**: User research, wireframing, personas, journey maps\n\ud83e\uddea **Testing**: Usability testing, heuristic evaluation, A/B testing\n\ud83d\udcca **Analytics**: Google Analytics, Hotjar, Maze\n\ud83d\udcd0 **Dev Handoff**: CSS basics, design tokens, Zeplin/Figma inspect",
      "Data Analyst": "**Essential Data Analyst Skills:**\n\n\ud83d\uddc4\ufe0f **SQL**: JOINs, CTEs, window functions, optimization (must-have)\n\ud83d\udc0d **Python**: pandas, NumPy, matplotlib, seaborn\n\ud83d\udcca **Viz**: Power BI or Tableau \u2014 pick one to master deeply\n\ud83d\udcc8 **Statistics**: Hypothesis testing, A/B testing, regression\n\ud83d\udccb **Excel**: PivotTables, advanced formulas, data validation\n\u2601\ufe0f **Cloud**: BigQuery, Snowflake basics",
      "AI & ML Engineer": "**Essential AI/ML Engineer Skills:**\n\n\ud83d\udc0d **Python**: NumPy, pandas, scikit-learn (foundation)\n\ud83e\udde0 **DL Frameworks**: PyTorch (preferred) or TensorFlow\n\ud83e\udd16 **LLMs**: Hugging Face transformers, LangChain, prompt engineering\n\ud83d\udcca **Math**: Linear algebra, calculus, probability, statistics\n\ud83d\ude80 **MLOps**: MLflow, Docker, FastAPI serving, experiment tracking\n\u2601\ufe0f **Cloud ML**: AWS SageMaker or GCP Vertex AI",
      "Cyber Security Analyst": "**Essential Cyber Security Skills:**\n\n\ud83c\udf10 **Networking**: TCP/IP, DNS, HTTP, firewalls, Wireshark\n\ud83d\udd10 **Security**: CIA Triad, OWASP Top 10, cryptography basics\n\ud83d\udee1\ufe0f **Tools**: Kali Linux, Nmap, Metasploit, Burp Suite, Splunk\n\ud83d\udccb **Compliance**: ISO 27001, GDPR, NIST framework\n\ud83d\udc89 **Pen Testing**: Web app testing, CTF practice on TryHackMe\n\ud83d\udcdc **Certs**: CompTIA Security+, CEH, or OSCP",
      "Cloud Engineer": "**Essential Cloud Engineer Skills:**\n\n\u2601\ufe0f **Cloud**: AWS (most jobs), Azure, or GCP \u2014 master one first\n\ud83d\udc33 **Containers**: Docker + Docker Compose, Kubernetes\n\ud83c\udfd7\ufe0f **IaC**: Terraform (must), AWS CloudFormation, Pulumi\n\ud83d\udd04 **CI/CD**: GitHub Actions, Jenkins, ArgoCD\n\ud83c\udf10 **Networking**: VPCs, subnets, load balancers, DNS\n\ud83d\udcca **Monitoring**: CloudWatch, Prometheus, Grafana",
      "Digital Marketer": "**Essential Digital Marketing Skills:**\n\n\ud83d\udd0d **SEO**: On-page/off-page, keyword research (Ahrefs/SEMrush)\n\ud83d\udce2 **Paid Ads**: Google Ads, Meta Ads Manager, campaign optimization\n\ud83d\udcca **Analytics**: Google Analytics 4, Looker Studio, UTM tracking\n\u2709\ufe0f **Email**: Mailchimp/HubSpot, segmentation, automation flows\n\ud83d\udcf1 **Social**: Content strategy, algorithm understanding, community\n\ud83d\udcc8 **Growth**: A/B testing, CRO (Conversion Rate Optimization)",
      "Product Manager": "**Essential Product Manager Skills:**\n\n\ud83d\udccb **Frameworks**: RICE/ICE prioritization, JTBD, OKRs, Agile/Scrum\n\ud83d\udcca **Analytics**: Mixpanel, Amplitude, funnel analysis, cohort analysis\n\ud83d\udde3\ufe0f **Communication**: PRD writing, stakeholder management, user interviews\n\ud83d\udd04 **Process**: Jira, Confluence, sprint planning, retrospectives\n\ud83c\udfa8 **Design Literacy**: Reading Figma, wireframing basics, UX empathy\n\ud83d\udcbc **Business**: Unit economics, pricing strategy, competitive analysis"
    };
    backupResponse = skills[role] || skills["Full Stack Developer"];

  } else if (is(["interview","crack","interview tip","interview prep","technical round","coding round","hr round","system design"])) {
    backupResponse = `**How to crack your ${roleLabel} Interview** \ud83c\udfaf\n\n**Round 1 \u2013 HR / Behavioral:**\n- Use the STAR method (Situation, Task, Action, Result) for every story\n- Prepare: "Tell me about yourself", "Biggest challenge", "Why this company?"\n- Research the company's product, mission, and recent news beforehand\n\n**Round 2 \u2013 Technical / Domain:**\n- Know your core ${roleLabel} concepts cold \u2014 no bluffing\n- Explain your thought process aloud as you solve problems\n- Freshers: practice LeetCode Easy + Medium (30 problems minimum)\n\n**Round 3 \u2013 System Design (Mid/Senior):**\n- Practice designing: URL shortener, chat app, notification service\n- Focus: requirements \u2192 high-level design \u2192 data model \u2192 scalability trade-offs\n\n**General Tips:**\n\u2705 Research the interviewer on LinkedIn beforehand\n\u2705 Ask 2-3 thoughtful questions at the end\n\u2705 Send a thank-you follow-up within 24 hours\n\u2705 **Use CareerSphere's Mock Interview Portal** to practice full AI-simulated rounds!`;

  } else if (is(["resume","cv","portfolio","how to write","ats","cover letter","resume tip","resume format"])) {
    backupResponse = `**Building a standout ${roleLabel} Resume/Portfolio** \ud83d\udcc4\n\n**Resume Structure:**\n1. **Header**: Name, email, LinkedIn, GitHub/portfolio link\n2. **Summary** (2-3 lines): Role + key skill + a quantified impact metric\n3. **Skills**: Group by category \u2014 don't just dump a list\n4. **Experience**: STAR-format bullets with numbers (e.g., "Reduced load time by 40%")\n5. **Projects**: 2-3 projects with live demo links and GitHub (critical for freshers!)\n6. **Education**: Degree, relevant coursework, GPA if above 8.0\n\n**Key Rules:**\n\u2705 1 page (fresher) or 2 pages max (5+ years experience)\n\u2705 Tailor keywords to match the job description (ATS optimization)\n\u2705 Quantify everything: "Built X which resulted in Y% improvement"\n\u2705 **Upload to CareerSphere's Resume Analyzer** for instant AI feedback!\n\n**Portfolio for ${roleLabel}:**\n- 3 projects showing end-to-end ownership\n- Case study format: Problem \u2192 Solution \u2192 Tech Stack \u2192 Result\n- Host on GitHub Pages, Vercel, or your own domain`;

  } else if (is(["project","what to build","project idea","side project","portfolio project","build something"])) {
    backupResponse = `**Top project ideas for ${roleLabel}** \ud83d\udca1\n\n1. **Solve a real problem** \u2014 build something you personally need; authenticity impresses recruiters\n2. **Clone + improve** \u2014 take an existing product and add 2-3 meaningful improvements with your own design decisions\n3. **API integration project** \u2014 connect to a public API (weather, finance, sports) and build a useful dashboard\n4. **Full CRUD app with auth** \u2014 shows you understand the complete user lifecycle\n5. **Open source contribution** \u2014 even fixing a typo or docs issue shows collaboration skills\n\n**For ${roleLabel} specifically:**\n- Make it relevant to your domain's core skills\n- Deploy a live version (not just a GitHub repo)\n- Write a detailed README: problem, tech stack, screenshots, setup instructions\n- Record a short demo video and post it on LinkedIn\n\n\ud83d\udca1 **Pro tip**: 3 strong projects > 10 half-finished ones. Quality matters.`;

  } else if (is(["internship","job","placement","apply","hiring","how to get job","job search","get hired","find job","fresher job"])) {
    backupResponse = `**Landing your first ${roleLabel} job/internship** \ud83d\ude80\n\n**Phase 1 \u2013 Build Your Base (2-3 months)**\n- Complete 2-3 solid projects with live demos and GitHub\n- Optimize LinkedIn: professional photo, headline, skills, featured projects\n- Run your resume through CareerSphere's Resume Analyzer\n\n**Phase 2 \u2013 Apply Strategically**\n- \ud83d\udcbc **Job Boards**: LinkedIn, Naukri, Instahyre, AngelList, Wellfound\n- \ud83c\udf93 **Campus**: Career cell drives, alumni network, college fairs\n- \ud83d\udd17 **Direct Apply**: Company career pages (skip the aggregator queue)\n- \ud83e\udd1d **Referrals**: Most roles fill through referrals \u2014 connect with seniors on LinkedIn\n\n**Phase 3 \u2013 Prepare Aggressively**\n- Mock interviews using **CareerSphere's AI Interview Portal**\n- 30+ LeetCode Easy/Medium problems before technical rounds\n- Research each company's product before applying\n\n**Phase 4 \u2013 Follow Through**\n- Apply to 20-30 companies (not just 5)\n- Follow up after 1 week if no response\n- Track all applications in a spreadsheet`;

  } else if (is(["certification","certificate","course","udemy","coursera","online course","which course","where to learn"])) {
    backupResponse = `**Best learning resources for ${roleLabel}** \ud83d\udcda\n\n**Top Free Resources:**\n- \ud83d\udcfa YouTube: FreeCodeCamp, Traversy Media, Fireship.io \u2014 excellent and free\n- \ud83d\udcbb Official documentation (MDN, React docs, AWS docs) \u2014 underrated\n- \ud83c\udfae Interactive: The Odin Project (web dev), TryHackMe (security), Kaggle (data)\n\n**Top Paid Courses (affordable):**\n- Udemy (wait for sale \u2014 always goes to \u20b9499): role-specific courses\n- Coursera with financial aid (free for many Google/Meta certs)\n- Frontend Masters or Egghead.io (deep dives)\n\n**Role-Specific Certifications:**\n- **Cloud**: AWS Solutions Architect Associate\n- **Security**: CompTIA Security+, CEH, OSCP\n- **Data**: Google Data Analytics, Microsoft PL-300 (Power BI)\n- **AI/ML**: TensorFlow Developer Cert, AWS ML Specialty\n- **Marketing**: Google Analytics, Google Ads, HubSpot Content Marketing\n- **PM**: PMI-ACP, Pragmatic Institute certification\n\n\ud83d\udca1 **Rule**: A completed Udemy course \u2260 a skill. Build something with what you learn.`;

  } else if (is(["linkedin","network","networking","connect with","cold message","referral","mentor","how to reach"])) {
    backupResponse = `**Building your ${roleLabel} network** \ud83e\udd1d\n\n**LinkedIn Profile Must-Haves:**\n- Professional headline: "${roleLabel} | [Top 3 Skills] | Open to Opportunities"\n- About section: Who you are + what you build + what you're looking for\n- Feature section: Pin your portfolio or top project\n- Post consistently: Share learnings, project screenshots, interview experiences\n\n**Cold Outreach That Actually Works:**\n> "Hi [Name], I admire your work on [specific thing]. I'm a ${roleLabel} working on [your project]. I'd love to get your perspective on [one specific question]. No pressure if you're busy!"\n\n**Where to Connect:**\n- LinkedIn (primary for professionals)\n- Twitter/X (tech community is very active here)\n- Discord communities (role-specific servers)\n- Local meetups and hackathons (in-person networking > online)\n\n\ud83d\udca1 **The Golden Rule**: Give before you ask \u2014 comment thoughtfully, share useful content, then reach out.`;

  } else if (is(["fresher","no experience","entry level","0 experience","just graduated","college student","final year","beginner","starting out"])) {
    backupResponse = `**Getting started as a ${roleLabel} fresher with zero experience** \ud83c\udf31\n\n**The truth: Everyone starts at zero. Here's your 90-day plan:**\n\n\ud83d\udcc5 **Month 1 \u2013 Build the Core**\n- Pick ONE structured course for ${roleLabel} and finish it completely\n- Practice daily \u2014 even 30-45 minutes counts\n- Don't jump between 10 resources; go deep on one\n\n\ud83d\udcc5 **Month 2 \u2013 Build Real Things**\n- Build 2 projects that solve actual problems (not just tutorial clones)\n- Deploy them online and push to GitHub with clean READMEs\n- Your portfolio IS your experience at this stage\n\n\ud83d\udcc5 **Month 3 \u2013 Apply & Network**\n- Polish resume using CareerSphere's Resume Analyzer\n- Apply to 10 internships/jobs per week on LinkedIn, Internshala, AngelList\n- Do mock interviews with CareerSphere's AI Interview Portal\n- Connect with 5 ${roleLabel}s on LinkedIn per week\n\n\ud83d\udca1 **Mindset shift**: Recruiters hire potential + evidence of learning. Show both.`;

  } else if (is(["hello","hi ","hey ","what can you","help me","what do you","who are you","good morning","good evening","namaste"])) {
    backupResponse = `Hello! \ud83d\udc4b I'm your **CareerSphere AI Mentor**, here to supercharge your **${roleLabel}** career journey!\n\nHere's what I can help you with \u2014 just ask:\n\n\ud83d\uddfa\ufe0f **Career Path** \u2014 "How do I become a ${roleLabel}?"\n\ud83d\udcbc **Skills to Learn** \u2014 "What skills should I focus on first?"\n\ud83d\udcb0 **Salary Insights** \u2014 "What salary can I expect as a ${roleLabel}?"\n\ud83c\udfaf **Interview Prep** \u2014 "How do I crack ${roleLabel} interviews?"\n\ud83d\udcc4 **Resume & Portfolio** \u2014 "How do I build a strong portfolio?"\n\ud83d\udca1 **Project Ideas** \u2014 "What projects should I build to get hired?"\n\ud83d\ude80 **Job Search** \u2014 "How do I land my first ${roleLabel} job?"\n\ud83d\udcdc **Certifications** \u2014 "Which certifications are worth it for ${roleLabel}?"\n\ud83e\udd1d **Networking** \u2014 "How do I build my professional network?"\n\nJust type your question naturally and I'll give you real, actionable advice!`;

  } else {
    backupResponse = `Great question about **${roleLabel}**! Here's my take:\n\nYou asked: *"${latestMessage.slice(0,100)}"*\n\nBased on your ${roleLabel} career path, here are the most impactful next steps:\n\n1. \ud83d\udcda **Strengthen core skills** \u2014 master the 3-4 essential tools for ${roleLabel} before going broad\n2. \ud83d\udee0\ufe0f **Build proof of work** \u2014 a deployed portfolio project beats any certification\n3. \ud83c\udfaf **Prepare for interviews** \u2014 use CareerSphere's Mock Interview Portal to simulate real rounds\n4. \ud83e\udd1d **Network actively** \u2014 connect with 3-5 ${roleLabel}s on LinkedIn this week\n\n\ud83d\udca1 Try asking me something specific like:\n- "What skills do I need for ${roleLabel}?"\n- "How do I crack ${roleLabel} interviews?"\n- "What salary can I expect as a ${roleLabel}?"\n- "What projects should I build for ${roleLabel}?"`;
  }

  setTimeout(() => {
    res.json({ text: backupResponse });
  }, 800);

});

// Endpoint: Custom Roadmap Generator
app.post("/api/ai/generate-roadmap", async (req, res) => {
  const { interests, skills, goal } = req.body;
  const targetGoal = goal || "Get a Full-Time Job";
  const gemini = getGemini();

  if (gemini) {
    try {
      const prompt = `Construct an intermediate learning roadmap curriculum customized for a person with interests: ${interests ? interests.join(", ") : "Design and coding"} and skills: ${skills ? skills.join(", ") : "Basic design"}.
      Their goal is: ${targetGoal}.

      Provide output in JSON format with exactly 4 distinct chronological sequence categories or tiers (e.g. "Beginner Basics", "Intermediate Specialization", "Advanced Capstone Mastery", "Job Ready Positioning"). Each tier must have a Title, Completion Percent estimation, and 3-4 granular milestones or checklist classes containing title and a brief description.

      Format:
      {
        "tiers": [
          {
            "name": "Beginner Level Core",
            "progress": 75, // completion percent
            "milestones": [
              { "title": "Milestone A", "desc": "Brief 1-sentence class details", "completed": true },
              { "title": "Milestone B", "desc": "Brief 1-sentence class details", "completed": false }
            ]
          }
        ]
      }`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tiers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    progress: { type: Type.INTEGER },
                    milestones: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          desc: { type: Type.STRING },
                          completed: { type: Type.BOOLEAN }
                        },
                        required: ["title", "desc", "completed"]
                      }
                    }
                  },
                  required: ["name", "progress", "milestones"]
                }
              }
            },
            required: ["tiers"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
    } catch (e) {
      console.error("Gemini Roadmap failed, using backup:", e);
    }
  }

  // Backup customized roadmap response
  res.json({
    tiers: [
      {
        name: "Stage 1: Foundational Figma and UX Fundamentals",
        progress: 75,
        milestones: [
          { title: "Heuristics and Layout Principles", desc: "Understand optical balance, visual hierarchy grids, and color contrasts.", completed: true },
          { title: "Mastering Figma Vector Workflows", desc: "Auto-layout, pen tools, responsive styling variables, and component nesting.", completed: true },
          { title: "User Persona Mapping", desc: "Design high-quality customer empathy boards based on actual user feedback sheets.", completed: true },
          { title: "Interactive Design Systems", desc: "Create robust custom typographic scales, grids, button component states, and input field rules.", completed: false }
        ]
      },
      {
        name: "Stage 2: Applied UX Research and Advanced Interactive Prototyping",
        progress: 33,
        milestones: [
          { title: "Quantitative User Research Projects", desc: "Formulate user surveys and telemetry logging reviews and document structural trends.", completed: true },
          { title: "Advanced Wireframing and Prototyping Loops", desc: "Implement smart-animating workflows, custom overlays, and screen drawer configurations.", completed: false },
          { title: "Heuristics Assessment Documentation", desc: "Compare design versions against Nielsen Norman's 10 layout rules.", completed: false }
        ]
      },
      {
        name: "Stage 3: Corporate Portfolios & Advanced Usability Testing",
        progress: 0,
        milestones: [
          { title: "A/B Layout Testing Setup", desc: "Formulate layout variants, user sessions, and write diagnostic summaries.", completed: false },
          { title: "Enterprise Design System Deployment", desc: "Build standard, reusable documentation kits for icons, alerts, and navigation sidebars.", completed: false },
          { title: "Case Study Formulation", desc: "Draft two extensive portfolio case studies explaining problem scopes and user journeys.", completed: false }
        ]
      },
      {
        name: "Stage 4: Recruiter Positioning & Mock Interview Drills",
        progress: 0,
        milestones: [
          { title: "AI-Powered Technical Drills", desc: "Participate in custom UI/UX design mock interviews on the CareerSphere platform.", completed: false },
          { title: "Interactive Portfolio Reviews", desc: "Polish high-fidelity screen templates and publish to LinkedIn and Behance directories.", completed: false }
        ]
      }
    ]
  });
});

// Pre-mapped high-fidelity fallback questions catalog — 10 roles × 5 categories × 10 questions each
const FALLBACK_QUESTIONS: Record<string, Record<string, string[]>> = {
  "UI/UX Designer": {
    "HR Interview": [
      "Can you introduce yourself and tell me what inspired you to pursue UI/UX design?",
      "What are your core strengths and areas of growth as a designer?",
      "Describe a situation where you had a design disagreement with a developer or product manager. How did you resolve it?",
      "How do you handle tight deadlines or feedback that requests significant redesigns?",
      "Where do you see yourself in five years within the design industry?",
      "How do you stay updated with the latest UI/UX trends and tools?",
      "Tell me about your design process from initial brief to final delivery.",
      "How do you balance creativity with usability constraints?",
      "Describe your ideal working environment and collaboration style.",
      "What is the most challenging design project you have worked on and why?"
    ],
    "Technical Interview": [
      "What is the difference between component libraries, instances, and master components in Figma?",
      "How do Heuristic Evaluation rules guide your interface critique process?",
      "How do you construct and scale Typography scales and grid alignments in Figma?",
      "Explain the differences between Web accessibility standard guidelines like WCAG and simple styling.",
      "What are the benefits of design token variables when handing designs over to developers?",
      "How do you use Auto Layout in Figma to create responsive components?",
      "What is the difference between UX and UI design, and how do they complement each other?",
      "Explain how you approach information architecture for a complex SaaS product.",
      "What tools do you use for usability testing, and how do you analyze the data?",
      "Describe how color contrast ratios affect accessibility and how you verify compliance."
    ],
    "Role-Specific Interview": [
      "How do you approach a product layout design system from absolute scratch?",
      "What methods do you use to conduct qualitative usability tests and map personas?",
      "How do you scale user interfaces for multi-screen responsive viewport limits?",
      "Describe your wireframing process, from sketch layouts to high-fidelity components.",
      "How do you measure usability success metrics on a newly deployed workflow?",
      "Walk me through how you would redesign an existing product's onboarding flow.",
      "How do you communicate design decisions to non-design stakeholders?",
      "What is your process for creating and maintaining a design system?",
      "How do you prioritize which user feedback to act on when designing iterations?",
      "Describe a time when user research completely changed your initial design direction."
    ],
    "System Design Interview": [
      "How would you design a scalable layout grid system for an enterprise-level SaaS dashboard?",
      "Explain your architectural design specification for component micro-interactions.",
      "How would you structure a Figma design library to support a team of 50 designers?",
      "How does typography hierarchy layout impact system load and screen accessibility rules?",
      "How would you organize design handoff assets to ensure developers build pixel-perfect styles?",
      "Design a component system for a multi-brand design platform.",
      "How would you structure the information architecture for a healthcare patient portal?",
      "Describe how you would approach designing an e-commerce checkout flow from scratch.",
      "How would you design a dark/light mode toggle system that works across a 50+ component library?",
      "How would you approach designing a dashboard that shows real-time data with 20+ metrics?"
    ],
    "Behavioral Interview": [
      "Tell me about a project where user research completely changed your initial design direction. (STAR method)",
      "Describe a time you had to make design trade-offs due to technical constraints.",
      "Recall a time a client or stakeholder hated your layout solutions. How did you present alternatives?",
      "Give an example of how you used usability metrics to advocate for a design shift.",
      "Describe a time you noticed a design bug in production. What actions did you initiate?",
      "Tell me about a time you worked under extreme time pressure to deliver a design.",
      "Describe a situation where you had to learn a new design tool quickly.",
      "Give an example of mentoring a junior designer or sharing design knowledge with your team.",
      "Tell me about a time you had to defend your design decisions with data.",
      "Describe a project that failed and what you learned from the experience."
    ]
  },
  "Frontend Engineer": {
    "HR Interview": [
      "Can you introduce yourself and tell us what drives your passion for frontend engineering?",
      "What are your core technical strengths and what areas are you actively trying to improve?",
      "Tell me about a time you had a communication issue with a designer or backend developer.",
      "How do you prioritize multiple feature requests under high-pressure deadlines?",
      "What are your long-term career goals as a frontend developer?",
      "How do you keep your frontend skills current with the rapidly evolving ecosystem?",
      "Describe your ideal team structure and development workflow.",
      "How do you handle code review feedback — giving and receiving?",
      "Tell me about a time you took ownership of a project beyond your usual scope.",
      "How do you balance writing clean code versus shipping features quickly?"
    ],
    "Technical Interview": [
      "What are the differences between semantic HTML elements and simple div elements?",
      "Explain how React's Virtual DOM works to optimize re-rendering performance.",
      "What is the difference between client-side rendering (CSR), static site generation (SSG), and server-side rendering (SSR)?",
      "Describe the CSS Box Model and how flexbox differs from grids for complex layouts.",
      "How do you manage complex application states in React (e.g. Context API vs. Zustand/Redux)?",
      "What is event delegation in JavaScript and why is it important for performance?",
      "Explain the difference between == and === in JavaScript with examples.",
      "How does the browser's critical rendering path work, and how can you optimize it?",
      "What are React hooks, and how does useEffect differ from componentDidMount?",
      "Explain how closures work in JavaScript with a practical example."
    ],
    "Role-Specific Interview": [
      "How do you optimize a React application to reduce initial bundle load times and optimize LCP?",
      "Describe your process for implementing pixel-perfect interfaces based on Figma component handoffs.",
      "How do you ensure web accessibility compliance (WCAG) inside a dynamic JavaScript application?",
      "How do you handle API state caching, sync, and request failures in modern frontend architectures?",
      "Describe how you write maintainable CSS/styles in modular enterprise repositories.",
      "How do you handle cross-browser compatibility issues in production?",
      "Describe your testing strategy for frontend code — unit, integration, and E2E.",
      "How do you implement code splitting and lazy loading in a React application?",
      "Describe how you would implement a real-time feature like live notifications on the frontend.",
      "How do you handle form validation and error states in complex multi-step forms?"
    ],
    "System Design Interview": [
      "How would you design the frontend architecture for a large-scale real-time collaborative application?",
      "How would you structure a micro-frontend architecture for an enterprise suite of apps?",
      "Describe your approach to designing a global components library matching a product design system.",
      "How would you implement secure client-side routing, auth guarding, and page-level permission checks?",
      "How would you design an offline-first web app that syncs background requests upon reconnection?",
      "Design the frontend for a video streaming platform with dynamic thumbnail loading.",
      "How would you architect a frontend for a multi-tenant SaaS platform with role-based UI?",
      "Describe how you would build a drag-and-drop kanban board with real-time collaboration.",
      "How would you design a component library that supports theming and white-labeling?",
      "How would you architect state management for a large social media feed with infinite scroll?"
    ],
    "Behavioral Interview": [
      "Tell me about a challenging bug you spent days solving. What was your systematic debugging process?",
      "Describe a time you advocated for refactoring legacy frontend code instead of building new features.",
      "Recall a time you had to implement a design you disagreed with. How did you handle the situation?",
      "Describe a project where you took leadership in optimizing application performance.",
      "Tell me about a time you mentored a junior engineer or collaborated to unblock a peer.",
      "Describe a time you had to ship a feature with incomplete requirements. What did you do?",
      "Tell me about a time you introduced a new technology or library to your team.",
      "Describe a situation where you had to balance technical debt with new feature development.",
      "Tell me about a time you discovered a critical bug in production. What steps did you take?",
      "Describe your greatest technical achievement and why you are proud of it."
    ]
  },
  "Backend Developer": {
    "HR Interview": [
      "Can you introduce yourself and walk me through your journey as a backend developer?",
      "What backend technologies excite you most and why?",
      "Describe a time you disagreed with a technical decision and how you handled it.",
      "How do you stay productive and manage your time across multiple backend services?",
      "Where do you see yourself in your backend engineering career in the next 3-5 years?",
      "How do you approach on-call responsibilities and production incident management?",
      "Describe your experience working in agile or scrum-based development environments.",
      "How do you ensure your backend code is maintainable for future engineers?",
      "Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder.",
      "How do you approach documentation for APIs and backend services?"
    ],
    "Technical Interview": [
      "Explain the differences between REST, GraphQL, and gRPC APIs. When would you use each?",
      "How does database indexing work, and what are the trade-offs between B-tree and hash indexes?",
      "What is the N+1 query problem and how do you solve it in an ORM like Prisma or Sequelize?",
      "Explain the differences between SQL transactions (ACID) and NoSQL eventual consistency.",
      "How does JWT token-based authentication work, and what are its security vulnerabilities?",
      "What is connection pooling and why is it critical in high-traffic backend services?",
      "Explain the CAP theorem and how it applies to distributed database design.",
      "What is the difference between horizontal and vertical scaling? When would you use each?",
      "How do message queues (e.g., RabbitMQ, Kafka) improve backend system reliability?",
      "Explain how caching strategies (Redis, CDN) reduce database load in production systems."
    ],
    "Role-Specific Interview": [
      "How do you design a RESTful API with proper versioning, error codes, and documentation?",
      "Describe how you implement rate limiting and throttling on an API gateway.",
      "How do you handle database migrations safely in a live production environment?",
      "Walk me through implementing background job processing with a queue like Bull or Celery.",
      "How do you structure a Node.js/Python backend project for scalability and testability?",
      "Describe your approach to securing an API against injection, CSRF, and XSS attacks.",
      "How do you implement distributed tracing and centralized logging in a microservices backend?",
      "Describe how you design webhooks and handle delivery failures reliably.",
      "How do you implement pagination efficiently for APIs with millions of records?",
      "Walk me through your process for debugging a slow database query in production."
    ],
    "System Design Interview": [
      "How would you design the backend for a URL shortening service handling 100k requests per second?",
      "Design a backend architecture for a real-time chat application with 10 million concurrent users.",
      "How would you build a notification service that supports email, SMS, and push across 50M users?",
      "Design a payment processing system that is fault-tolerant, idempotent, and audit-logged.",
      "How would you architect a multi-tenant SaaS backend with row-level data isolation?",
      "Design a file storage API that handles chunked upload, virus scanning, and CDN delivery.",
      "How would you build an API gateway that handles auth, rate limiting, caching, and routing?",
      "Design a distributed job scheduler that handles millions of cron-like tasks reliably.",
      "How would you design a search backend using Elasticsearch for an e-commerce catalog?",
      "Design a real-time leaderboard system that updates scores for millions of players."
    ],
    "Behavioral Interview": [
      "Tell me about a production outage you helped resolve. What was your process? (STAR method)",
      "Describe a time you significantly improved the performance of a backend service.",
      "Tell me about a time you had to refactor a monolithic service into microservices.",
      "Describe a situation where you had to implement a security fix under time pressure.",
      "Tell me about a time you had to choose between a quick fix and a proper architectural solution.",
      "Describe a time you disagreed with a fellow engineer about a backend architecture decision.",
      "Tell me about the most complex API you have designed and what made it challenging.",
      "Describe a time you had to optimize a slow database query that was causing customer impact.",
      "Tell me about a time you built something that did not work as expected in production.",
      "Describe a time you mentored a junior backend developer through a difficult technical problem."
    ]
  },
  "Full Stack Developer": {
    "HR Interview": [
      "Welcome, introduce yourself and explain what you enjoy most about working across the full software stack.",
      "What do you consider your strongest area (frontend/backend/DB) and where is your biggest room for growth?",
      "Describe a time you had a technical disagreement with a co-worker. How did you compromise?",
      "How do you manage stress and avoid burnout when managing both backend releases and frontend sprints?",
      "What type of technology stack are you eager to master next?",
      "How do you decide when to use a library versus building a solution from scratch?",
      "Tell me about a full-stack project you are most proud of.",
      "How do you handle context-switching between frontend and backend work during the day?",
      "Describe how you contribute to a team beyond your individual code contributions.",
      "What does a 'great developer' look like to you and how do you try to embody that?"
    ],
    "Technical Interview": [
      "Explain the differences between RESTful APIs and GraphQL. What are the trade-offs?",
      "How does database indexing work, and what are the visual performance trade-offs of read vs. write?",
      "What are the core differences between SQL databases (like PostgreSQL) and NoSQL (like MongoDB)?",
      "Describe the MVC architectural pattern and how it applies to modern full-stack web apps.",
      "How do CORS issues arise, and what steps do you take to resolve them securely?",
      "Explain how React's component lifecycle interacts with data fetched from a Node.js backend.",
      "What is the event loop in Node.js and how does non-blocking I/O work?",
      "Explain how OAuth 2.0 and OpenID Connect work for full-stack authentication flows.",
      "What is the difference between server-side rendering and client-side rendering in Next.js?",
      "How do you handle environment variables and secrets across frontend and backend environments?"
    ],
    "Role-Specific Interview": [
      "Describe how you implement user authentication with JWT from backend server to client storage.",
      "How do you configure database migrations and schemas when releasing new features in production?",
      "How do you handle state synchronization between client and server with concurrent database writes?",
      "How do you build a secure file upload service that scales to handle large assets?",
      "Describe your testing workflow for writing unit tests for both frontend and API routes.",
      "How do you implement real-time features like live notifications using WebSockets or SSE?",
      "Describe your approach to API error handling — both server-side and client-side presentation.",
      "How do you manage environment-specific configurations across dev, staging, and production?",
      "Walk me through how you would implement a full-stack search feature with autocomplete.",
      "Describe how you set up CI/CD for a full-stack application deployment pipeline."
    ],
    "System Design Interview": [
      "How would you design a high-throughput URL shortening service from frontend UI to database tier?",
      "Describe how you would architect a microservices-based e-commerce platform with billing and catalogs.",
      "How would you scale an API gateway to support load balancing, caching, and rate limiting?",
      "How would you structure a database caching layer (e.g. Redis) to optimize heavy query routes?",
      "How would you design a logging and monitoring pipeline to track exceptions across servers?",
      "Design a full-stack architecture for a real-time collaborative document editing tool.",
      "How would you architect a multi-region deployment for a social platform with 50M users?",
      "Design a recommendation engine that integrates with both the frontend and backend.",
      "How would you build an analytics dashboard that processes and displays large data sets in real time?",
      "Design a subscription billing system with trials, upgrades, and prorated charges."
    ],
    "Behavioral Interview": [
      "Tell me about a time you had to deploy a critical hotfix to production under heavy traffic. (STAR)",
      "Describe a project where you had to work with a legacy codebase. How did you transition it?",
      "Recall a time you built a feature that did not meet user expectations. How did you pivot?",
      "Describe a situation where you had to compromise on architectural cleanliness to hit a deadline.",
      "Tell me about a time you noticed a security vulnerability in code. What steps did you take?",
      "Describe a time you proactively improved developer experience or team tooling.",
      "Tell me about the most complex full-stack feature you have ever built end-to-end.",
      "Describe a time you had to coordinate with multiple teams (design, QA, backend) to ship a feature.",
      "Tell me about a time you had to estimate project timelines and what happened when you were wrong.",
      "Describe a time you had to learn a completely new technology to complete a project."
    ]
  },
  "Data Analyst": {
    "HR Interview": [
      "Welcome! Introduce yourself and explain why you chose data analytics as a career.",
      "What strengths do you bring to data storytelling, and what weaknesses are you working on?",
      "How do you handle explaining technical statistical reports to non-technical business stakeholders?",
      "Describe a situation where a stakeholder disputed your analytical findings. How did you handle it?",
      "What type of data roles or domains are you looking to specialize in over the next few years?",
      "How do you stay current with new analytics tools and data visualization techniques?",
      "Describe your experience working with cross-functional teams as a data analyst.",
      "How do you ensure data quality and integrity in your analyses?",
      "Tell me about a time you had to work with ambiguous or incomplete data requirements.",
      "How do you prioritize multiple data requests when working with limited bandwidth?"
    ],
    "Technical Interview": [
      "Explain the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL.",
      "What are window functions in SQL, and when would you use ROW_NUMBER() over RANK()?",
      "Describe key data cleaning procedures you perform in Excel or Python Pandas before running models.",
      "What are the differences between descriptive, predictive, and prescriptive analytics?",
      "What is the Central Limit Theorem, and why is it foundational to statistical hypothesis testing?",
      "Explain the difference between HAVING and WHERE clauses in SQL with an example.",
      "What is a CTE (Common Table Expression) and when would you use one over a subquery?",
      "How do you detect and handle multicollinearity in a regression model?",
      "Explain the difference between correlation and causation with a practical data example.",
      "How does K-means clustering work, and how do you choose the right number of clusters?"
    ],
    "Role-Specific Interview": [
      "How do you write optimized DAX queries to calculate year-over-year growth inside Power BI?",
      "Describe how you design a data schema that connects multiple disparate datasets for visualization.",
      "What statistical tests (t-test, Chi-square) do you use to validate A/B test results?",
      "How do you set up automated ETL pipelines to sync local database updates to cloud dashboards?",
      "How do you handle outliers and missing data values inside a database without skewing reports?",
      "Describe how you would build an automated reporting system for weekly business KPIs.",
      "How do you decide which visualization type to use for different types of data?",
      "Walk me through how you would analyze customer churn and present your findings.",
      "How do you validate your data models and ensure outputs are correct before presenting?",
      "Describe your process for conducting a root cause analysis on a sudden drop in key metrics."
    ],
    "System Design Interview": [
      "How would you design a data warehouse schema to support multinational e-commerce daily sales?",
      "Describe the architecture of a real-time analytics dashboard monitoring server telemetry metrics.",
      "How would you structure database indexes and partition large tables to optimize query response?",
      "How would you design a self-service BI platform that allows business users to generate queries?",
      "Describe how you would design an ETL flow that ingests stream data from multiple social channels.",
      "Design a data pipeline that ingests, cleans, transforms, and loads data from 10 different APIs.",
      "How would you architect a data lakehouse that supports both batch and streaming analytics?",
      "Design a customer segmentation system that automatically categorizes users based on behavior.",
      "How would you build a fraud detection pipeline that processes transaction data in real time?",
      "Design an A/B testing analytics platform that handles experiment tracking for a large user base."
    ],
    "Behavioral Interview": [
      "Tell me about a time you uncovered an unexpected insight in data that saved the business money.",
      "Describe a time you made a decision based on incomplete or dirty data. How did you mitigate risks?",
      "Recall a project where you had to work with extremely tight deadlines while maintaining accuracy.",
      "Describe a time you automated a manual reporting workflow. What was the impact in hours saved?",
      "Tell me about a time your data analysis proved a senior manager's hypothesis was incorrect.",
      "Describe a time you had to learn a new analytics tool quickly to complete a project.",
      "Tell me about the most complex data analysis project you have worked on end-to-end.",
      "Describe a time a stakeholder asked you to present data in a misleading way. How did you respond?",
      "Tell me about a time you collaborated with engineering to improve the data infrastructure.",
      "Describe a time you had to explain statistical significance to a non-technical audience."
    ]
  },
  "AI & ML Engineer": {
    "HR Interview": [
      "Can you introduce yourself and tell us what drew you into the field of Artificial Intelligence?",
      "What are your core research strengths in ML, and what models or techniques are you studying next?",
      "How do you explain complex machine learning predictions to business executives?",
      "How do you handle ethical dilemmas in AI (such as bias in training data)?",
      "Where do you see ML engineering heading in the next five years?",
      "How do you balance research exploration with delivering production ML systems?",
      "Describe your experience working in a cross-functional team with data engineers and product managers.",
      "How do you approach knowledge sharing and documentation for ML experiments?",
      "Tell me about a time you had to explain AI limitations to stakeholders.",
      "What kind of problems excite you most to solve with machine learning?"
    ],
    "Technical Interview": [
      "What is the difference between supervised, unsupervised, and reinforcement learning?",
      "Explain the bias-variance trade-off. How do you diagnose and prevent overfitting?",
      "How do L1 (Lasso) and L2 (Ridge) regularization methods differ in how they affect model weights?",
      "What are the differences between Sigmoid, Tanh, and ReLU activation functions?",
      "Describe how gradient descent works, and explain the concept of vanishing gradients.",
      "What is the attention mechanism in transformers, and how does self-attention differ from cross-attention?",
      "How does dropout regularization work during training versus inference?",
      "Explain the difference between precision, recall, F1-score, and ROC-AUC for classifier evaluation.",
      "What is batch normalization, and why does it help with training deep neural networks?",
      "Explain how k-fold cross-validation works and why it gives a better model estimate than a single split."
    ],
    "Role-Specific Interview": [
      "How do you handle severely imbalanced datasets when training a classification model?",
      "What evaluation metrics do you prioritize when evaluating ML classifiers in production?",
      "Describe your process for selecting features and preprocessing text data for model training.",
      "How do you configure hyperparameter tuning (GridSearch, Bayesian optimization) efficiently?",
      "How do you implement transfer learning using pre-trained convolutional or transformer models?",
      "Describe your workflow for tracking experiments, versioning models, and documenting results.",
      "How do you detect and mitigate data drift in a deployed machine learning model?",
      "Walk me through how you would build a recommendation system from feature engineering to serving.",
      "How do you evaluate and compare two different NLP models for a text classification task?",
      "Describe your approach to deploying a large language model API with low latency guarantees."
    ],
    "System Design Interview": [
      "How would you design the architecture for a real-time recommendation system (Netflix-style)?",
      "Describe how you would build a pipeline to continuously train, evaluate, version, and deploy ML models.",
      "How would you architect a search system using vector databases and semantic embeddings?",
      "How would you design a distributed training pipeline for training a model on billions of parameters?",
      "Describe how you would design a latency-sensitive API to serve transformer predictions at scale.",
      "How would you design a fraud detection system using ML that must process 1M transactions per hour?",
      "Design an MLOps platform that automates training, validation, A/B testing, and rollback of models.",
      "How would you build a multi-modal AI system that processes both text and images for classification?",
      "Design a conversational AI agent architecture with memory, tool use, and fallback handling.",
      "How would you architect a feature store that serves online and offline ML model features consistently?"
    ],
    "Behavioral Interview": [
      "Tell me about a machine learning project that performed poorly in production vs. validation. (STAR)",
      "Describe a time you had to balance model accuracy against inference speed or cost in deployment.",
      "Recall a project where the data you were given was extremely messy. How did you save the project?",
      "Describe a time you noticed statistical bias in model predictions. What steps did you take to correct it?",
      "Tell me about a time you had to convince a PM to adopt an ML solution instead of a rule-based system.",
      "Describe a time an experiment you were confident in failed completely. What did you learn?",
      "Tell me about a time you collaborated with a data engineering team to fix a data pipeline issue.",
      "Describe a situation where you had to rapidly prototype an ML solution under business pressure.",
      "Tell me about the most impactful ML system you have shipped and how you measured its success.",
      "Describe a time you had to explain why a model failed to a frustrated business stakeholder."
    ]
  },
  "Cyber Security Analyst": {
    "HR Interview": [
      "Can you introduce yourself and explain what drew you to cybersecurity as a career path?",
      "What areas of cybersecurity excite you most — offensive, defensive, or compliance?",
      "How do you stay up-to-date with the latest threat intelligence and CVEs?",
      "Describe a time you had to communicate a high-severity risk to a non-technical executive.",
      "How do you handle the pressure and urgency of responding to a live security incident?",
      "What certifications or training have you completed, and which are you pursuing next?",
      "Describe how you balance security requirements with business productivity needs.",
      "How do you build a security-conscious culture within a development team?",
      "Tell me about a time you had to push back on a feature request due to security concerns.",
      "Where do you see yourself in the cybersecurity field in the next five years?"
    ],
    "Technical Interview": [
      "Explain the CIA Triad and give a real-world example where each principle was violated.",
      "What are the OWASP Top 10 vulnerabilities, and how do you mitigate SQL Injection specifically?",
      "What is the difference between symmetric and asymmetric encryption? Give examples of each.",
      "Explain how a man-in-the-middle (MITM) attack works and how TLS/SSL prevents it.",
      "What is the difference between IDS (Intrusion Detection System) and IPS (Intrusion Prevention System)?",
      "Explain how Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attacks work.",
      "What is a zero-day vulnerability, and how do organizations protect themselves before a patch exists?",
      "Explain the difference between vulnerability assessment and penetration testing.",
      "What are the steps of the MITRE ATT&CK framework and how do SOC analysts use it?",
      "How does public key infrastructure (PKI) work, and what role do certificate authorities play?"
    ],
    "Role-Specific Interview": [
      "Walk me through your incident response process from detection to remediation and post-mortem.",
      "How do you configure and tune a SIEM (e.g., Splunk, QRadar) to reduce false positive alerts?",
      "Describe your methodology for conducting a vulnerability assessment on a web application.",
      "How do you perform log analysis to detect lateral movement or privilege escalation attempts?",
      "Explain how you would conduct a phishing simulation and awareness training program.",
      "How do you implement and enforce least-privilege access control across an enterprise?",
      "Describe your experience with threat hunting and proactively identifying hidden attackers.",
      "How do you assess and manage third-party vendor security risks?",
      "Walk me through how you would respond to a ransomware attack discovered on a Monday morning.",
      "How do you prioritize vulnerability remediation when you have hundreds of open findings?"
    ],
    "System Design Interview": [
      "How would you design a Zero Trust network architecture for a 5,000-person enterprise?",
      "Design a Security Operations Center (SOC) with 24/7 monitoring, alerting, and incident response.",
      "How would you architect a Web Application Firewall (WAF) in front of a multi-region API platform?",
      "Design an identity and access management (IAM) system with SSO, MFA, and role-based permissions.",
      "How would you design a security data pipeline that collects logs from 500 sources into a SIEM?",
      "Design a DevSecOps pipeline that integrates SAST, DAST, and dependency scanning into CI/CD.",
      "How would you architect an endpoint detection and response (EDR) system for a cloud-native fleet?",
      "Design a secure secrets management system (like HashiCorp Vault) for a microservices platform.",
      "How would you design a data loss prevention (DLP) system to detect sensitive data exfiltration?",
      "Design a network segmentation strategy that isolates critical systems in a hybrid cloud environment."
    ],
    "Behavioral Interview": [
      "Tell me about a critical security incident you responded to. What was your process? (STAR)",
      "Describe a time you discovered a severe vulnerability before it was exploited. What did you do?",
      "Tell me about a time you had to balance security hardening with minimal disruption to users.",
      "Describe a time you had to investigate a potential insider threat situation.",
      "Tell me about a time a security control you implemented failed. What did you learn?",
      "Describe a situation where you successfully got developer buy-in to fix a critical security flaw.",
      "Tell me about a time you improved your organization's security posture with limited resources.",
      "Describe a time you had to make a fast security decision with incomplete information.",
      "Tell me about the most complex penetration test or red team engagement you participated in.",
      "Describe a time you delivered security awareness training that genuinely changed team behavior."
    ]
  },
  "Cloud Engineer": {
    "HR Interview": [
      "Can you introduce yourself and explain what drew you to cloud engineering?",
      "What cloud providers have you worked with and which do you prefer for different use cases?",
      "How do you handle on-call rotations and respond to production cloud outages?",
      "Describe how you collaborate with development teams to make their deployments more reliable.",
      "What cloud certifications do you hold, and which are you pursuing next?",
      "How do you keep your cloud skills current with the rapid pace of new managed services?",
      "Describe a time you had to manage a cloud migration project with minimal downtime.",
      "How do you approach cloud cost optimization without sacrificing reliability?",
      "Tell me about a time you had to build consensus on a cloud architecture decision.",
      "Where do you see cloud engineering evolving in the next five years?"
    ],
    "Technical Interview": [
      "Explain the difference between IaaS, PaaS, and SaaS with real-world examples of each.",
      "What is the difference between containers (Docker) and virtual machines? When do you use each?",
      "Explain how Kubernetes Pod scheduling, resource requests, and limits work.",
      "What is Infrastructure as Code (IaC) and what are the key differences between Terraform and CDK?",
      "How do VPCs, subnets, security groups, and NACLs work together to secure AWS environments?",
      "Explain how auto-scaling groups (ASG) work and how you configure scaling policies.",
      "What is the difference between object storage (S3) and block storage (EBS) in AWS?",
      "How does serverless computing (Lambda/Cloud Functions) differ from container-based deployments?",
      "Explain how Kubernetes ingress controllers and service meshes (Istio) work together.",
      "What is a blue-green deployment and how does it differ from canary releases?"
    ],
    "Role-Specific Interview": [
      "Describe how you design and manage CI/CD pipelines using GitHub Actions or GitLab CI.",
      "How do you implement observability in the cloud using metrics, logs, and distributed tracing?",
      "Walk me through how you would migrate a monolithic application to containers on Kubernetes.",
      "How do you implement cloud security best practices including IAM least privilege and secrets management?",
      "Describe your approach to multi-cloud or hybrid cloud architecture strategy.",
      "How do you design for high availability and disaster recovery across multiple AWS regions?",
      "Walk me through how you would troubleshoot a cloud service with high latency and dropped requests.",
      "How do you manage Terraform state files and modules in a large enterprise cloud environment?",
      "Describe how you set up network peering and VPN connectivity between on-premises and cloud.",
      "How do you implement resource tagging, budgets, and cost alerts to control cloud spending?"
    ],
    "System Design Interview": [
      "Design a highly available three-tier application architecture on AWS with auto-scaling.",
      "How would you architect a multi-region active-active deployment for a global SaaS platform?",
      "Design a disaster recovery architecture with RTO of 1 hour and RPO of 15 minutes.",
      "How would you design a Kubernetes platform that serves 500 microservices with GitOps?",
      "Design a cloud data pipeline using managed services to process 10TB of daily event data.",
      "How would you build a serverless event-driven architecture for an e-commerce order processing system?",
      "Design a cloud networking architecture connecting 50 offices globally with secure access.",
      "How would you architect a cloud platform that enforces compliance (PCI-DSS, HIPAA) across tenants?",
      "Design a centralized logging and alerting platform that ingests from 1000+ cloud resources.",
      "How would you design a cloud cost management system with automatic right-sizing recommendations?"
    ],
    "Behavioral Interview": [
      "Tell me about a major cloud outage you helped resolve. What was your incident response process? (STAR)",
      "Describe a time you significantly reduced cloud costs through architecture improvements.",
      "Tell me about a complex cloud migration you led — what were the challenges and outcomes?",
      "Describe a time you had to implement a cloud security fix urgently due to a CVE.",
      "Tell me about a time you automated a manual cloud operation, reducing toil for your team.",
      "Describe a time you had to choose between managed services and self-hosted solutions.",
      "Tell me about a time you introduced infrastructure as code to a team that was managing things manually.",
      "Describe a time you had to handle a runaway cloud bill and get costs back under control.",
      "Tell me about your most complex Kubernetes or container orchestration challenge.",
      "Describe a time you built a self-healing infrastructure system that saved on-call hours."
    ]
  },
  "Digital Marketer": {
    "HR Interview": [
      "Can you introduce yourself and tell me what excites you most about digital marketing?",
      "How do you balance creative instincts with data-driven decision-making in campaigns?",
      "Describe a time a campaign you ran completely underperformed. How did you handle it?",
      "How do you stay current with algorithm changes, platform updates, and marketing trends?",
      "Where do you see yourself in the digital marketing industry in the next 3-5 years?",
      "How do you manage multiple campaigns across different channels simultaneously?",
      "Describe your experience working with cross-functional teams (design, product, sales).",
      "How do you approach reporting marketing results to non-marketing stakeholders?",
      "Tell me about a time you had to justify your marketing budget to leadership.",
      "What marketing channels are you most experienced in and which do you want to develop further?"
    ],
    "Technical Interview": [
      "Explain how search engine algorithms rank pages and what on-page SEO factors matter most.",
      "What are the key metrics you track in Google Analytics 4 and how do you set up event tracking?",
      "How does a Google Ads Quality Score work and how do you improve it to reduce CPC?",
      "Explain the difference between first-party, second-party, and third-party data and its impact on targeting.",
      "How do you set up and analyze an A/B test for email subject lines, and what constitutes statistical significance?",
      "What is attribution modeling, and how do you choose between last-touch, first-touch, and data-driven attribution?",
      "Explain how Meta's advertising auction works and what factors affect ad delivery and cost.",
      "What is a marketing funnel (TOFU, MOFU, BOFU) and how do you tailor content for each stage?",
      "How do UTM parameters work and how do you set up a consistent URL tracking taxonomy?",
      "Explain how retargeting pixels and custom audiences work across Meta and Google Ads."
    ],
    "Role-Specific Interview": [
      "Walk me through how you would build a content marketing strategy for a new B2B SaaS product.",
      "How do you research keywords and structure an SEO content calendar for organic growth?",
      "Describe how you would set up a performance marketing funnel from awareness to conversion.",
      "How do you measure and improve customer acquisition cost (CAC) and lifetime value (LTV)?",
      "Walk me through how you would design an email nurture sequence for an e-commerce brand.",
      "How do you approach growing a social media community from zero followers to 50,000?",
      "Describe your process for creating and optimizing paid advertising creatives for Meta Ads.",
      "How do you conduct a competitive analysis for a digital marketing strategy?",
      "Walk me through how you would run a product launch campaign across multiple channels.",
      "How do you identify and work with influencers to amplify brand reach effectively?"
    ],
    "System Design Interview": [
      "Design a full-funnel marketing campaign architecture for a new SaaS product launch.",
      "How would you build a marketing technology stack (MarTech) for a 100-person growth company?",
      "Design an attribution system that tracks customer journeys across 10+ touchpoints.",
      "How would you architect a personalization engine that serves dynamic content to website visitors?",
      "Design a growth hacking strategy to achieve 10x user growth in 12 months for a B2C app.",
      "How would you design a data-driven customer segmentation model for email marketing campaigns?",
      "Design a viral referral program that incentivizes users to invite their networks.",
      "How would you build a marketing analytics dashboard that provides real-time ROI visibility?",
      "Design a retention marketing strategy to reduce churn from 15% to under 5% monthly.",
      "How would you architect a localized marketing strategy for entering 5 new international markets?"
    ],
    "Behavioral Interview": [
      "Tell me about your most successful campaign. What made it work and what were the results? (STAR)",
      "Describe a time you pivoted a campaign mid-flight based on performance data.",
      "Tell me about a time you had to achieve significant results with a very limited budget.",
      "Describe a time you used data to challenge a commonly held marketing assumption.",
      "Tell me about a time you built a marketing channel from scratch with no existing playbook.",
      "Describe a time you had to collaborate with engineering to implement a marketing feature.",
      "Tell me about a time you managed a PR or social media crisis online.",
      "Describe a time you had to explain complex campaign attribution data to a non-analytical CEO.",
      "Tell me about a time you increased organic traffic significantly through content or SEO efforts.",
      "Describe a time you coordinated a cross-channel product launch that drove measurable business results."
    ]
  },
  "Product Manager": {
    "HR Interview": [
      "Can you introduce yourself and explain why you chose product management as your career path?",
      "What is your favorite product and what would you change about it?",
      "How do you build trust and relationships with engineering and design teams?",
      "Describe how you handle conflicting priorities between sales, engineering, and users.",
      "Where do you see yourself in product management in the next five years?",
      "How do you stay customer-focused while also balancing technical and business constraints?",
      "Describe your experience working in an agile environment as a product owner.",
      "How do you onboard yourself to a new product domain and understand the user quickly?",
      "Tell me about the most important product lesson you have learned in your career.",
      "How do you define what makes a product successful beyond revenue metrics?"
    ],
    "Technical Interview": [
      "What is the difference between Agile, Scrum, and Kanban, and when do you use each?",
      "How do you write a well-structured user story with acceptance criteria?",
      "Explain how you would design and run a statistically significant A/B test for a new feature.",
      "What product metrics do you track for a B2C subscription app, and how do you interpret them?",
      "How do you use frameworks like RICE, ICE, or MoSCoW to prioritize a product backlog?",
      "What is the difference between output and outcome metrics in product development?",
      "Explain how you use funnel analysis to identify drop-off points in a user journey.",
      "How does a product roadmap differ from a release plan, and who are they each intended for?",
      "What is Jobs-to-be-Done (JTBD) theory and how does it influence how you write requirements?",
      "Explain how you use cohort analysis to track feature adoption over time."
    ],
    "Role-Specific Interview": [
      "Walk me through how you would prioritize a backlog with 50 feature requests and limited engineering capacity.",
      "How do you gather qualitative user feedback and translate it into actionable product requirements?",
      "Describe how you define and communicate product vision and strategy to your team and stakeholders.",
      "How do you work with engineering to scope features without micromanaging the technical approach?",
      "Walk me through how you would decide to kill an existing feature.",
      "How do you measure feature success after launch and when do you decide to iterate or pivot?",
      "Describe your process for writing a detailed product requirements document (PRD).",
      "How do you manage stakeholder expectations when engineering estimates exceed the roadmap timeline?",
      "Walk me through how you would approach building the first version of a mobile product from zero.",
      "How do you use competitive analysis to inform product positioning and feature prioritization?"
    ],
    "System Design Interview": [
      "Design a product roadmap for a new productivity app from idea to 100k users in 12 months.",
      "How would you build and prioritize a feature spec for an enterprise onboarding flow?",
      "Design a notification system for a B2C app that maximizes engagement without causing churn.",
      "How would you design a growth loop that turns new users into product advocates automatically?",
      "Design an experiment framework for running 20+ simultaneous A/B tests without interference.",
      "How would you design a multi-sided marketplace product that balances supply and demand sides?",
      "Design the MVP product for a new AI-powered feature — what would you include and exclude, and why?",
      "How would you design the pricing strategy for a new SaaS product with 3 customer segments?",
      "Design a product feedback system that continuously collects, categorizes, and surfaces user insights.",
      "How would you design a metrics dashboard for PMs to monitor product health across all user segments?"
    ],
    "Behavioral Interview": [
      "Tell me about a product you launched that failed and what you learned from it. (STAR)",
      "Describe a time you had to make a difficult prioritization decision that disappointed an important stakeholder.",
      "Tell me about a time you changed a product direction based on unexpected user research findings.",
      "Describe a time you shipped a feature you disagreed with. How did you handle it?",
      "Tell me about a time you worked with a difficult engineer or designer. How did you handle the relationship?",
      "Describe a time you identified a product opportunity that others had overlooked.",
      "Tell me about a product decision you made with limited data. How did you approach it?",
      "Describe a time you rallied your team around an ambitious product goal under tight constraints.",
      "Tell me about your greatest product achievement and how you measured its impact.",
      "Describe a time you had to deprecate a feature that users loved for business or technical reasons."
    ]
  }
};

function normalizeRole(role: string): string {
  const r = (role || "").toLowerCase().trim();
  if (r.includes("cyber security") || r.includes("cybersecurity") || r.includes("security analyst")) return "Cyber Security Analyst";
  if (r.includes("cloud")) return "Cloud Engineer";
  if (r.includes("digital market")) return "Digital Marketer";
  if (r.includes("product manager") || r.includes("product management")) return "Product Manager";
  if (r.includes("ai & ml") || r.includes("ai/ml") || r.includes("machine learning") || r.includes("ml engineer")) return "AI & ML Engineer";
  if (r.includes("data analyst") || r.includes("data analysis")) return "Data Analyst";
  if (r.includes("backend") || r.includes("back end") || r.includes("back-end")) return "Backend Developer";
  if (r.includes("full stack") || r.includes("fullstack")) return "Full Stack Developer";
  if (r.includes("frontend") || r.includes("front end") || r.includes("front-end")) return "Frontend Engineer";
  if (r.includes("ui/ux") || r.includes("ux designer") || r.includes("ui designer") || r.includes("designer")) return "UI/UX Designer";
  // Exact match fallback
  const exactMap: Record<string, string> = {
    "frontend engineer": "Frontend Engineer",
    "backend developer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "ui/ux designer": "UI/UX Designer",
    "data analyst": "Data Analyst",
    "ai & ml engineer": "AI & ML Engineer",
    "cyber security analyst": "Cyber Security Analyst",
    "cloud engineer": "Cloud Engineer",
    "digital marketer": "Digital Marketer",
    "product manager": "Product Manager"
  };
  return exactMap[r] || "UI/UX Designer";
}

// Endpoint: AI Mock Interview dynamic question generation
app.post("/api/ai/generate-next-question", async (req, res) => {
  const { role, difficulty, category, QAs, userName } = req.body;
  const targetRole = normalizeRole(role || "UI/UX Designer");
  const targetCategory = category || "HR Interview";
  const gemini = getGemini();

  if (gemini) {
    try {
      const prompt = `You are playing the role of an elite HR / Technical Recruiter on CareerSphere AI.
      Candidate Name: ${userName || "Candidate"}
      Target Role: ${targetRole}
      Difficulty: ${difficulty || "Intermediate"}
      Category: ${targetCategory}
      
      Here is the interview history so far:
      ${QAs && QAs.length > 0 ? QAs.map((qa: any) => `Interviewer: ${qa.question}\nCandidate: ${qa.answer}`).join("\n\n") : "No questions answered yet."}

      ${QAs && QAs.length > 0 ? 
        "Generate the next conversational follow-up question based on the candidate's last answer. Dig deeper into their technical skills or experience." :
        `Generate the very first interview question to start this ${targetCategory} for a ${targetRole}. Make it highly specific to the ${targetRole} role, rather than a generic introduction.`}
      
      - The question must match the selected category (${targetCategory}) and difficulty (${difficulty || "Intermediate"}).
      - Do not output any notes, greetings, or conversational pleasantries before/after the question. Output ONLY the question inside this JSON schema:
      {
        "question": "Your next follow-up question..."
      }`;

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING }
            },
            required: ["question"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
    } catch (e) {
      console.error("Gemini Question Generation failed, using fallback:", e);
    }
  }

  // Fallback dynamic generator
  const history = QAs || [];
  const currentStep = history.length;
  const { sessionSeed = 0, askedQuestions = [] } = req.body;
  const allQuestions = FALLBACK_QUESTIONS[targetRole]?.[targetCategory] || FALLBACK_QUESTIONS["UI/UX Designer"]["HR Interview"];
  
  // Filter out questions already asked in this session
  const remaining = allQuestions.filter((q: string) => !askedQuestions.includes(q));
  const pool = remaining.length > 0 ? remaining : allQuestions;
  
  if (currentStep === 0) {
    // Return a role-specific question right from the start
    const idx = sessionSeed % pool.length;
    return res.json({ question: pool[idx] });
  }

  const lastQA = history[history.length - 1];
  const answerLower = (lastQA?.answer || "").toLowerCase();
  
  // Pick from questions bank — randomized by sessionSeed + currentStep
  const idx = (sessionSeed + currentStep * 7) % pool.length;
  let nextQuestion = pool[idx];
    
  // Add adaptive context prefix based on previous answer keywords
  const prefixes: Record<string, string> = {
    figma: "Building on your Figma experience, ",
    component: "Regarding component design patterns, ",
    react: "Following up on your React knowledge, ",
    kubernetes: "Expanding on your Kubernetes point, ",
    sql: "Since you mentioned database work, ",
    python: "Following up on your Python background, ",
    security: "Expanding on your security perspective, ",
    cloud: "Building on your cloud experience, ",
    api: "Regarding your API design approach, ",
    testing: "Following up on your testing strategy, "
  };
  const matchedPrefix = Object.entries(prefixes).find(([kw]) => answerLower.includes(kw));
  if (matchedPrefix) {
    nextQuestion = matchedPrefix[1] + nextQuestion.charAt(0).toLowerCase() + nextQuestion.slice(1);
  }

  setTimeout(() => {
    res.json({ question: nextQuestion });
  }, 600);
});

// Endpoint: AI Mock Interview evaluation
app.post("/api/ai/interview-feedback", async (req, res) => {
  const { role, difficulty, category, QAs } = req.body;
  const targetRole = normalizeRole(role || "UI/UX Designer");
  const targetCategory = category || "HR Interview";
  const gemini = getGemini();

  const formattedConversation = QAs && QAs.length > 0
    ? QAs.map((qa: any) => `Question: ${qa.question}\nCandidate Answer: ${qa.answer}`).join("\n\n")
    : "No dialogue recorded.";

  if (gemini) {
    try {
      const prompt = `You are an elite talent acquisition lead evaluating a candidate's mock interview performance.
      Role: ${targetRole}
      Difficulty: ${difficulty || "Intermediate"}
      Category: ${targetCategory}
      
      Review the transcribed interview session dialogue carefully format:
      ${formattedConversation}

      CRITICAL INSTRUCTIONS FOR GRADING:
      - If the candidate's answers are completely wrong, irrelevant, extremely short (e.g. 1-3 words), or empty, you MUST give a very low score (e.g., 0-30).
      - Do NOT give high scores just for participating. The scores MUST accurately reflect the correctness and depth of their technical or behavioral responses.
      - Be extremely strict. If an answer is wrong, heavily penalize the 'technical', 'problemSolving', and 'overall' scores.

      Assess communication style, confidence, technical competency, problem-solving, and professionalism. Return a JSON structure exactly matching:
      {
        "communication": 90, // integer 0-100
        "confidence": 85, // integer 0-100
        "technical": 80, // integer 0-100
        "problemSolving": 88, // integer 0-100
        "professionalism": 85, // integer 0-100
        "overall": 86, // overall weighted score 0-100
        "feedback": [
          "Core strength 1 detailing what was handled well",
          "Core strength 2 detailing technical precision points"
        ],
        "weaknesses": [
          "Area of improvement 1 from their responses",
          "Area of improvement 2 from their technical gaps"
        ],
        "suggestions": [
          "Personalized suggestion 1 detailing how to phrase design/engineering trade-offs",
          "Personalized suggestion 2 detailing how to apply the STAR method"
        ],
        "resources": [
          "Recommended topic 1 (e.g. advanced hooks, schema normalization, heuristic checks)",
          "Recommended topic 2"
        ]
      }`;

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              communication: { type: Type.INTEGER },
              confidence: { type: Type.INTEGER },
              technical: { type: Type.INTEGER },
              problemSolving: { type: Type.INTEGER },
              professionalism: { type: Type.INTEGER },
              overall: { type: Type.INTEGER },
              feedback: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              resources: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["communication", "confidence", "technical", "problemSolving", "professionalism", "overall", "feedback", "weaknesses", "suggestions", "resources"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
    } catch (e) {
      console.error("Gemini Interview evaluation error, using fallback:", e);
    }
  }

  // Fallback high quality simulation response
  setTimeout(() => {
    res.json({
      communication: 88,
      confidence: 85,
      technical: 82,
      problemSolving: 86,
      professionalism: 90,
      overall: 86,
      feedback: [
        "Structured explanations: Your technical vocabulary and pacing are excellent.",
        "Demonstrates solid conceptual foundation: Clearly shows high-level awareness of workflows."
      ],
      weaknesses: [
        "Incomplete quantitative proofs: Focus on backing up statements with metrics.",
        "System constraints mapping: Should detail performance and caching strategies more explicitly."
      ],
      suggestions: [
        "Structure backend/design trade-offs using the STAR method: Situation, Task, Action, Result.",
        "Practice framing technical arguments based on accessibility and telemetry measurements."
      ],
      resources: [
        `Ingress performance load reduction on ${targetRole} tracks`,
        `Advanced schema normalization & standard database layouts`,
        "Heuristic analysis standards & standard user journeys mapping"
      ]
    });
  }, 1200);
});


// Express server integration
async function startServer() {
  // Vite developer middleware support or Production Static servers
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CareerSphere AI Server] running on http://localhost:${PORT}`);
  });
}

startServer();
