import React, { useState, useEffect } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { Menu, Sun, Moon,  
  Home, FileText, BarChart3, Map, MessageSquare, Award, Briefcase, User, 
  Settings, Bell, Search, TrendingUp, Sparkles, Upload, CheckCircle2, ChevronRight,
  Flame, Lock, Send, UserX, Star, Filter, Heart, ArrowUpRight, GraduationCap, RefreshCw, AlertTriangle, AlertCircle, Check,
  Youtube, ExternalLink, Mail, MapPin, X
 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Message, JobPost, InterviewMetric } from "../types";
import MockInterviewPortal from "./MockInterviewPortal";

interface Milestone {
  title: string;
  desc: string;
  completed: boolean;
  youtubeUrl?: string;
  websiteUrl?: string;
}

interface SyllabusTier {
  name: string;
  progress: number;
  milestones: Milestone[];
}

const getSyllabusForRole = (role: string): SyllabusTier[] => {
  switch (role) {
    case "Data Analyst":
      return [
        {
          name: "Stage 1: Excel & SQL Fundamentals",
          progress: 50,
          milestones: [
            { title: "Excel for Data Analytics", desc: "Master pivot tables, VLOOKUP, and basic data cleaning techniques.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Excel%20for%20Data%20Analytics%20tutorial", websiteUrl: "https://support.microsoft.com/en-us/excel" },
            { title: "SQL Querying Fundamentals", desc: "Learn SELECT queries, joins, group by, and subqueries.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=SQL%20Querying%20Fundamentals%20tutorial", websiteUrl: "https://www.w3schools.com/sql/" }
          ]
        },
        {
          name: "Stage 2: Python & Data Wrangling",
          progress: 0,
          milestones: [
            { title: "Python Basics for Data Science", desc: "Understand data structures, loops, functions, and libraries like Pandas and NumPy.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Python%20Basics%20for%20Data%20Science%20tutorial", websiteUrl: "https://docs.python.org/3/" },
            { title: "Power BI Dashboard Design", desc: "Build interactive dashboards, DAX queries, and visual charts.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Power%20BI%20Dashboard%20Design%20tutorial", websiteUrl: "https://learn.microsoft.com/en-us/power-bi/" }
          ]
        },
        {
          name: "Stage 3: Advanced Analytics & Modeling",
          progress: 0,
          milestones: [
            { title: "Statistical Modeling Essentials", desc: "Apply hypothesis testing, regressions, and statistical forecasting.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Statistical%20Modeling%20Essentials%20tutorial", websiteUrl: "https://www.khanacademy.org/math/statistics-probability" },
            { title: "Data Storytelling & Reporting", desc: "Present insights clearly using Tableau and communicate to stakeholders.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Data%20Storytelling%20%26%20Reporting%20tutorial", websiteUrl: "https://help.tableau.com/current/pro/desktop/en-us/default.htm" }
          ]
        },
        {
          name: "Stage 4: Portfolio Prep & Mock Interviews",
          progress: 0,
          milestones: [
            { title: "Recruiter Portfolio Preparation", desc: "Build a GitHub repository showcasing data analysis case studies.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Recruiter%20Portfolio%20Preparation%20tutorial", websiteUrl: "https://docs.github.com/en" },
            { title: "Mock Interview Drills", desc: "Practice SQL live tests and behavioral case interview structures.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Mock%20Interview%20Drills%20tutorial", websiteUrl: "https://www.pramp.com/#/" }
          ]
        }
      ];

    case "Frontend Engineer":
      return [
        {
          name: "Stage 1: HTML, CSS & Modern JS ES6+",
          progress: 50,
          milestones: [
            { title: "Semantic HTML5 & Responsive CSS Layouts", desc: "Learn Flexbox, Grid, semantic HTML structure, and media queries.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Semantic%20HTML5%20%26%20Responsive%20CSS%20Layouts%20tutorial", websiteUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
            { title: "Modern JavaScript (ES6+)", desc: "Master asynchronous code, array methods, DOM manipulation, and API fetching.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Modern%20JavaScript%20(ES6%2B)%20tutorial", websiteUrl: "https://javascript.info/" }
          ]
        },
        {
          name: "Stage 2: React Framework & Styling",
          progress: 0,
          milestones: [
            { title: "React Basics & Hooks", desc: "Understand components, state (useState, useEffect), props, and custom hooks.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=React%20Basics%20%26%20Hooks%20tutorial", websiteUrl: "https://react.dev/" },
            { title: "Tailwind CSS & Responsive Styling", desc: "Style modern websites using utility-first classes and custom themes.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Tailwind%20CSS%20%26%20Responsive%20Styling%20tutorial", websiteUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML" }
          ]
        },
        {
          name: "Stage 3: Server Routing & Next.js",
          progress: 0,
          milestones: [
            { title: "Next.js SSR & Server Actions", desc: "Understand Server-Side Rendering, routing, API routes, and Server Actions.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Next.js%20SSR%20%26%20Server%20Actions%20tutorial", websiteUrl: "https://nextjs.org/docs" },
            { title: "State Management with Zustand", desc: "Manage complex React application states using Zustand and Redux Toolkit.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=State%20Management%20with%20Zustand%20tutorial", websiteUrl: "https://zustand-demo.pmnd.rs/" }
          ]
        },
        {
          name: "Stage 4: Testing & Deployment",
          progress: 0,
          milestones: [
            { title: "Unit Testing & Performance", desc: "Write tests using Vitest/Jest, and optimize performance indicators (LCP/FID).", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Unit%20Testing%20%26%20Performance%20tutorial", websiteUrl: "https://vitest.dev/" },
            { title: "Deployment & CI/CD", desc: "Configure Vercel/Netlify hosting and automate build tests using GitHub Actions.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Deployment%20%26%20CI%2FCD%20tutorial", websiteUrl: "https://docs.github.com/en/actions" }
          ]
        }
      ];

    case "AI & ML Engineer":
      return [
        {
          name: "Stage 1: Math & Python Basics",
          progress: 50,
          milestones: [
            { title: "Linear Algebra & Probability", desc: "Understand matrix operations, probability distributions, and calculus basics.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Linear%20Algebra%20%26%20Probability%20tutorial", websiteUrl: "https://www.khanacademy.org/math/linear-algebra" },
            { title: "Python for Machine Learning", desc: "Utilize NumPy, Pandas, Scikit-learn, and Jupyter Notebooks environment.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Python%20for%20Machine%20Learning%20tutorial", websiteUrl: "https://docs.python.org/3/" }
          ]
        },
        {
          name: "Stage 2: Machine Learning Algorithms",
          progress: 0,
          milestones: [
            { title: "Supervised Learning Models", desc: "Implement Linear/Logistic regressions, decision trees, and SVMs.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Supervised%20Learning%20Models%20tutorial", websiteUrl: "https://scikit-learn.org/stable/" },
            { title: "Deep Learning with PyTorch", desc: "Construct multi-layer perceptrons, CNNs, and backpropagation models.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Deep%20Learning%20with%20PyTorch%20tutorial", websiteUrl: "https://pytorch.org/tutorials/" }
          ]
        },
        {
          name: "Stage 3: NLP & Generative AI",
          progress: 0,
          milestones: [
            { title: "Large Language Models & Prompting", desc: "Work with OpenAI/Gemini SDKs, system instructions, and temperature metrics.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Large%20Language%20Models%20%26%20Prompting%20tutorial", websiteUrl: "https://platform.openai.com/docs/" },
            { title: "Vector Databases & RAG Systems", desc: "Build retrieval augmented generation pipelines using Pinecone and LangChain.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Vector%20Databases%20%26%20RAG%20Systems%20tutorial", websiteUrl: "https://www.pinecone.io/learn/" }
          ]
        },
        {
          name: "Stage 4: MLOps & Deployment",
          progress: 0,
          milestones: [
            { title: "Model Deployment with FastAPI", desc: "Expose ML models as REST APIs, dockerize configurations, and scale models.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Model%20Deployment%20with%20FastAPI%20tutorial", websiteUrl: "https://docs.github.com/en/actions" },
            { title: "MLflow & Pipeline Tracking", desc: "Track parameters, evaluate model drift, and manage pipelines using MLflow.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=MLflow%20%26%20Pipeline%20Tracking%20tutorial", websiteUrl: "https://mlflow.org/docs/latest/index.html" }
          ]
        }
      ];

    case "Cyber Security Analyst":
      return [
        {
          name: "Stage 1: Networking & Systems Administration",
          progress: 50,
          milestones: [
            { title: "TCP/IP Protocols & Port Scanning", desc: "Understand subnets, DNS, protocols (HTTP, SSH), and diagnostic tools.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=TCP%2FIP%20Protocols%20%26%20Port%20Scanning%20tutorial", websiteUrl: "https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13769-5.html" },
            { title: "Linux OS Security Baselines", desc: "Master the Linux command line, file system permissions, and users.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Linux%20OS%20Security%20Baselines%20tutorial", websiteUrl: "https://ubuntu.com/tutorials/command-line-for-beginners" }
          ]
        },
        {
          name: "Stage 2: Security Controls & Defense",
          progress: 0,
          milestones: [
            { title: "Firewalls, VPNs & Log Analysis", desc: "Configure firewalls, analyze access logs, and detect suspicious scans.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Firewalls%2C%20VPNs%20%26%20Log%20Analysis%20tutorial", websiteUrl: "https://www.fortinet.com/resources/cyberglossary/what-is-a-firewall" },
            { title: "Penetration Testing Basics", desc: "Understand Metasploit, Nmap, vulnerability scanning, and local network exploits.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Penetration%20Testing%20Basics%20tutorial", websiteUrl: "https://vitest.dev/" }
          ]
        },
        {
          name: "Stage 3: Application Security & Standards",
          progress: 0,
          milestones: [
            { title: "OWASP Top 10 Security", desc: "Identify SQL injections, XSS, CSRF vulnerabilities and mitigation techniques.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=OWASP%20Top%2010%20Security%20tutorial", websiteUrl: "https://owasp.org/www-project-top-ten/" },
            { title: "Cryptography & Secure Access", desc: "Learn hashing, symmetric/asymmetric encryption, and TLS certificate setup.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Cryptography%20%26%20Secure%20Access%20tutorial", websiteUrl: "https://en.wikipedia.org/wiki/Cryptography" }
          ]
        },
        {
          name: "Stage 4: Incident Response",
          progress: 0,
          milestones: [
            { title: "Threat Hunting & SIEM Tools", desc: "Configure Splunk/ELK, correlate alerts, and draft incident response procedures.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Threat%20Hunting%20%26%20SIEM%20Tools%20tutorial", websiteUrl: "https://www.splunk.com/en_us/resources/what-is-siem.html" },
            { title: "Mock Interview & Credentials Prep", desc: "Prepare security report logs and practice CompTIA Security+ mock exams.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Mock%20Interview%20%26%20Credentials%20Prep%20tutorial", websiteUrl: "https://www.pramp.com/#/" }
          ]
        }
      ];

    case "Cloud Engineer":
      return [
        {
          name: "Stage 1: Cloud Architecture Foundations",
          progress: 50,
          milestones: [
            { title: "Introduction to AWS/GCP/Azure", desc: "Learn key cloud benefits, shared responsibility models, and cloud consoles.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Introduction%20to%20AWS%2FGCP%2FAzure%20tutorial", websiteUrl: "https://aws.amazon.com/getting-started/" },
            { title: "Virtual Machines & Object Storage", desc: "Spin up EC2 instances, configure S3 buckets, and map security groups.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Virtual%20Machines%20%26%20Object%20Storage%20tutorial", websiteUrl: "https://www.pinecone.io/learn/" }
          ]
        },
        {
          name: "Stage 2: IAM & Advanced Networking",
          progress: 0,
          milestones: [
            { title: "Identity & Access Management (IAM)", desc: "Configure users, roles, MFA, and access control policies.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Identity%20%26%20Access%20Management%20(IAM)%20tutorial", websiteUrl: "https://docs.aws.amazon.com/iam/" },
            { title: "VPCs & Serverless Functions", desc: "Configure custom VPCs, subnets, route tables, and trigger AWS Lambda functions.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=VPCs%20%26%20Serverless%20Functions%20tutorial", websiteUrl: "https://aws.amazon.com/vpc/" }
          ]
        },
        {
          name: "Stage 3: DevOps Containerization",
          progress: 0,
          milestones: [
            { title: "Docker Containers & Kubernetes", desc: "Write Dockerfiles, build local images, and manage pod orchestration.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Docker%20Containers%20%26%20Kubernetes%20tutorial", websiteUrl: "https://kubernetes.io/docs/home/" },
            { title: "Infrastructure as Code (Terraform)", desc: "Write declarative configuration files to launch auto-scaling groups.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Infrastructure%20as%20Code%20(Terraform)%20tutorial", websiteUrl: "https://developer.hashicorp.com/terraform/docs" }
          ]
        },
        {
          name: "Stage 4: CI/CD & Cloud Analytics",
          progress: 0,
          milestones: [
            { title: "Cloud Monitoring & Logging", desc: "Set up CloudWatch/CloudTrail log alerts and configure budgets.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Cloud%20Monitoring%20%26%20Logging%20tutorial", websiteUrl: "https://docs.aws.amazon.com/cloudwatch/" },
            { title: "Enterprise Cloud Portfolio Prep", desc: "Demonstrate automated pipeline deployments in active recruiter reviews.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Enterprise%20Cloud%20Portfolio%20Prep%20tutorial", websiteUrl: "https://docs.github.com/en" }
          ]
        }
      ];

    case "Digital Marketer":
      return [
        {
          name: "Stage 1: Modern Digital Marketing Principles",
          progress: 50,
          milestones: [
            { title: "Introduction to Digital Marketing channels", desc: "Learn SEO, SEM, content strategy, email funnels, and customer metrics.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Introduction%20to%20Digital%20Marketing%20channels%20tutorial", websiteUrl: "https://blog.hubspot.com/marketing/what-is-digital-marketing" },
            { title: "Content Strategy & Copywriting", desc: "Craft compelling titles, email newsletters, and long-form blog guides.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Content%20Strategy%20%26%20Copywriting%20tutorial", websiteUrl: "https://copyhackers.com/" }
          ]
        },
        {
          name: "Stage 2: Traffic Acquisition & Ads",
          progress: 0,
          milestones: [
            { title: "Search Engine Optimization (SEO)", desc: "Perform keyword research, optimize meta tags, and build backlinks.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Search%20Engine%20Optimization%20(SEO)%20tutorial", websiteUrl: "https://moz.com/beginners-guide-to-seo" },
            { title: "Paid Social & Search Advertising", desc: "Set up campaigns on Google Ads and Meta Ads with targeted demographics.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Paid%20Social%20%26%20Search%20Advertising%20tutorial", websiteUrl: "https://ads.google.com/" }
          ]
        },
        {
          name: "Stage 3: Telemetry & Analytical Models",
          progress: 0,
          milestones: [
            { title: "Google Analytics 4 (GA4)", desc: "Track page events, conversion rates, sessions, and traffic sources.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Google%20Analytics%204%20(GA4)%20tutorial", websiteUrl: "https://analytics.google.com/" },
            { title: "Growth Hacking & A/B Testing", desc: "Iterate landing page visual styles, CTAs, and analyze heatmaps.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Growth%20Hacking%20%26%20A%2FB%20Testing%20tutorial", websiteUrl: "https://vitest.dev/" }
          ]
        },
        {
          name: "Stage 4: Recruiter Positioning & Portfolio",
          progress: 0,
          milestones: [
            { title: "Marketing Case Study Portfolio", desc: "Write reports highlighting ROI, click-through rates, and customer acquisition.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Marketing%20Case%20Study%20Portfolio%20tutorial", websiteUrl: "https://docs.github.com/en" },
            { title: "Interview Practice Drills", desc: "Practice presenting marketing metrics to acquisition teams.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Interview%20Practice%20Drills%20tutorial", websiteUrl: "https://www.pramp.com/#/" }
          ]
        }
      ];

    case "Product Manager":
      return [
        {
          name: "Stage 1: Agile Foundations & Role Scope",
          progress: 50,
          milestones: [
            { title: "Introduction to Product Management", desc: "Understand target markets, user personas, and life cycle strategies.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Introduction%20to%20Product%20Management%20tutorial", websiteUrl: "https://www.atlassian.com/agile/product-management" },
            { title: "Agile & Scrum Methodologies", desc: "Understand sprints, user stories, ticket structures, and daily standups.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Agile%20%26%20Scrum%20Methodologies%20tutorial", websiteUrl: "https://www.scrum.org/resources/what-is-scrum" }
          ]
        },
        {
          name: "Stage 2: Strategy, MVP & Roadmapping",
          progress: 0,
          milestones: [
            { title: "User Research & PRDs", desc: "Conduct qualitative user research and draft Product Requirement Documents.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=User%20Research%20%26%20PRDs%20tutorial", websiteUrl: "https://www.productplan.com/glossary/product-requirements-document/" },
            { title: "Defining MVP & Product Roadmap", desc: "Prioritize features using RICE, and build interactive roadmap timelines.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Defining%20MVP%20%26%20Product%20Roadmap%20tutorial", websiteUrl: "https://www.productplan.com/learn/what-is-a-product-roadmap/" }
          ]
        },
        {
          name: "Stage 3: Product Operations & Analytics",
          progress: 0,
          milestones: [
            { title: "Product Analytics (Amplitude/Mixpanel)", desc: "Track activation metrics, cohorts, retention curves, and A/B test results.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Product%20Analytics%20(Amplitude%2FMixpanel)%20tutorial", websiteUrl: "https://amplitude.com/" },
            { title: "Stakeholder Alignment & Handoffs", desc: "Manage communications with design, engineering, and sales leads.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Stakeholder%20Alignment%20%26%20Handoffs%20tutorial", websiteUrl: "https://www.mindtools.com/pages/article/newPPM_07.htm" }
          ]
        },
        {
          name: "Stage 4: Recruiter Positioning & Interview Mock Drills",
          progress: 0,
          milestones: [
            { title: "Product Case Study Reviews", desc: "Write case reviews highlighting product launches and user satisfaction curves.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Product%20Case%20Study%20Reviews%20tutorial", websiteUrl: "https://www.google.com/search?q=Product%20Case%20Study%20Reviews%20documentation" },
            { title: "AI Mock Practice Drills", desc: "Practice solving product design, estimation, and strategy interview prompts.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=AI%20Mock%20Practice%20Drills%20tutorial", websiteUrl: "https://www.pramp.com/#/" }
          ]
        }
      ];

    case "UI/UX Designer":
    default:
      return [
        {
          name: "Beginner Level Basic Tier",
          progress: 75,
          milestones: [
            { title: "Figma Baselines & Tools", desc: "Auto-layout components, grids, and vectors.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Figma%20Baselines%20%26%20Tools%20tutorial", websiteUrl: "https://help.figma.com/hc/en-us" },
            { title: "Wireframing Essentials", desc: "Low fidelity paper schemas and rapid paper runs.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Wireframing%20Essentials%20tutorial", websiteUrl: "https://balsamiq.com/learn/articles/what-are-wireframes/" },
            { title: "UX Design Principles", desc: "Nielsen's 10 Heuristics and human layouts.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=UX%20Design%20Principles%20tutorial", websiteUrl: "https://www.nngroup.com/articles/ten-usability-heuristics/" },
            { title: "Design Thinking Ideations", desc: "Structuring user-centered brainstorm blueprints.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Design%20Thinking%20Ideations%20tutorial", websiteUrl: "https://www.interaction-design.org/literature/topics/design-thinking" }
          ]
        },
        {
          name: "Intermediate Applied Specialization",
          progress: 33,
          milestones: [
            { title: "Design Systems & Tokens", desc: "Consistent variables, alerts, grids, and buttons.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=Design%20Systems%20%26%20Tokens%20tutorial", websiteUrl: "https://m3.material.io/" },
            { title: "Applied UX Research Methods", desc: "Direct qualitative target focus surveys.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Applied%20UX%20Research%20Methods%20tutorial", websiteUrl: "https://www.productplan.com/glossary/product-requirements-document/" },
            { title: "Advanced Prototyping Systems", desc: "Page variables, custom delays, and sheet drawers.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Advanced%20Prototyping%20Systems%20tutorial", websiteUrl: "https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma" }
          ]
        },
        {
          name: "Advanced Capstone Projects",
          progress: 0,
          milestones: [
            { title: "Modern Usability Testing", desc: "Iterating drafts based on strict physical tests.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Modern%20Usability%20Testing%20tutorial", websiteUrl: "https://vitest.dev/" },
            { title: "Comprehensive Case Studies", desc: "Drafting complete visual breakdown slides.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Comprehensive%20Case%20Studies%20tutorial", websiteUrl: "https://www.google.com/search?q=Comprehensive%20Case%20Studies%20documentation" }
          ]
        },
        {
          name: "Job Ready Positioning",
          progress: 0,
          milestones: [
            { title: "Mock Interview Drills", desc: "Automated candidate assessment tests.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Mock%20Interview%20Drills%20tutorial", websiteUrl: "https://www.pramp.com/#/" },
            { title: "Direct Placement Applications", desc: "Submit profiles directly to Nexis AI Solutions or Freshworks.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Direct%20Placement%20Applications%20tutorial", websiteUrl: "https://www.google.com/search?q=Direct%20Placement%20Applications%20documentation" }
          ]
        }
      ];
    case "Full Stack Developer":
      return [
        {
          name: "Stage 1: Frontend & Backend Basics",
          progress: 50,
          milestones: [
            { title: "React Component Architecture", desc: "Build modular, styled, and responsive React applications.", completed: true , youtubeUrl: "https://www.youtube.com/results?search_query=React%20Component%20Architecture%20tutorial", websiteUrl: "https://react.dev/" },
            { title: "Node.js & Express API Development", desc: "Create RESTful APIs, routing configurations, and middleware integrations.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Node.js%20%26%20Express%20API%20Development%20tutorial", websiteUrl: "https://expressjs.com/" }
          ]
        },
        {
          name: "Stage 2: Database Management & Security",
          progress: 0,
          milestones: [
            { title: "NoSQL Databases & MongoDB", desc: "Design data schemas, perform CRUD operations, and write advanced queries.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=NoSQL%20Databases%20%26%20MongoDB%20tutorial", websiteUrl: "https://www.w3schools.com/sql/" },
            { title: "Token Authentication & Security", desc: "Implement JWT, session managers, password hashing, and CORS protocols.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Token%20Authentication%20%26%20Security%20tutorial", websiteUrl: "https://owasp.org/www-project-top-ten/" }
          ]
        },
        {
          name: "Stage 3: Systems Architecture & Testing",
          progress: 0,
          milestones: [
            { title: "State Management & Optimization", desc: "Configure global state networks and optimize API payload sizes.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=State%20Management%20%26%20Optimization%20tutorial", websiteUrl: "https://zustand-demo.pmnd.rs/" },
            { title: "Unit Testing & Performance", desc: "Write test suites using Vitest and verify overall app loading indicators.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Unit%20Testing%20%26%20Performance%20tutorial", websiteUrl: "https://vitest.dev/" }
          ]
        },
        {
          name: "Stage 4: DevOps & Cloud Deployments",
          progress: 0,
          milestones: [
            { title: "Docker Container Configurations", desc: "Build clean Dockerfiles, orchestrate container links, and manage volumes.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=Docker%20Container%20Configurations%20tutorial", websiteUrl: "https://kubernetes.io/docs/home/" },
            { title: "CI/CD & Cloud Hosting", desc: "Set up GitHub Actions pipelines and host deployments on AWS or GCP.", completed: false , youtubeUrl: "https://www.youtube.com/results?search_query=CI%2FCD%20%26%20Cloud%20Hosting%20tutorial", websiteUrl: "https://docs.github.com/en/actions" }
          ]
        }
      ];
  }
};

const getLearningProgressForRole = (role: string) => {
  switch (role) {
    case "Data Analyst":
      return [
        { skill: 'SQL & Database Queries', progress: 75, color: 'bg-purple-600' },
        { skill: 'Excel & Data Cleaning', progress: 50, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Python Analytics Basics', progress: 20, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Frontend Engineer":
      return [
        { skill: 'React Hooks & State', progress: 70, color: 'bg-purple-600' },
        { skill: 'CSS layouts & Grid system', progress: 60, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'ES6+ JavaScript Logic', progress: 30, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Full Stack Developer":
      return [
        { skill: 'React Frontend Structure', progress: 65, color: 'bg-purple-600' },
        { skill: 'Express Node Server Setup', progress: 45, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'MongoDB Queries & Schemas', progress: 20, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "AI & ML Engineer":
      return [
        { skill: 'Linear Algebra Mathematics', progress: 75, color: 'bg-purple-600' },
        { skill: 'Python Scikit-learn Models', progress: 45, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Deep Neural Net Concepts', progress: 15, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Cyber Security Analyst":
      return [
        { skill: 'TCP/IP Diagnostic Scans', progress: 60, color: 'bg-purple-600' },
        { skill: 'Linux Security Permissions', progress: 55, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Firewall Access Rules', progress: 10, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Cloud Engineer":
      return [
        { skill: 'AWS IAM Roles Configuration', progress: 65, color: 'bg-purple-600' },
        { skill: 'Virtual Machines deployment', progress: 50, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Docker Container Systems', progress: 15, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Digital Marketer":
      return [
        { skill: 'SEO keyword optimization', progress: 80, color: 'bg-purple-600' },
        { skill: 'Content plan writing strategies', progress: 60, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Meta and Google Ads setups', progress: 25, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "Product Manager":
      return [
        { skill: 'Agile story definition', progress: 75, color: 'bg-purple-600' },
        { skill: 'User persona diagnostic charts', progress: 50, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Amplitude Product Analytics', progress: 10, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
    case "UI/UX Designer":
    default:
      return [
        { skill: 'Figma Layout & Grids', progress: 75, color: 'bg-purple-600' },
        { skill: 'Applied UX Research methods', progress: 40, color: 'bg-emerald-50 dark:bg-emerald-900/300' },
        { skill: 'Advanced Prototyping rules', progress: 25, color: 'bg-blue-50 dark:bg-blue-900/300' }
      ];
  }
};

const getCurrentSkillsForRole = (role: string) => {
  switch (role) {
    case "Data Analyst":
      return [
        { name: 'Basic Excel Spreadsheets', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'SQL Query Foundations', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Tableau Dashboards', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Python Basics coding', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Frontend Engineer":
      return [
        { name: 'HTML & CSS Layouts', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'DOM JS manipulation', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'React component setup', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Tailwind framework basics', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Full Stack Developer":
      return [
        { name: 'React Component structures', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Node.js Express Server setup', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'NoSQL Databases & MongoDB', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Dockerized setups configurations', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "AI & ML Engineer":
      return [
        { name: 'Python mathematical programming', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Linear Algebra matrix concepts', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Scikit-learn model setups', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'PyTorch deep modeling rules', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Cyber Security Analyst":
      return [
        { name: 'TCP/IP Diagnostic Port Scans', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Linux command line operations', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Firewalls security baselines', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Penetration tests standards', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Cloud Engineer":
      return [
        { name: 'AWS Cloud Console navigation', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Elastic Cloud VMs instances setup', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'S3 Secure Objects storage setups', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Terraform configuration templates', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Digital Marketer":
      return [
        { name: 'Content Marketing strategies', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Search Engine Optimization (SEO)', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Mail newsletters campaign rules', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Paid Social Ads dashboard setups', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "Product Manager":
      return [
        { name: 'Agile product sprint rules', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'User persona interview logs', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'PRD document writing templates', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Amplitude funnel tracking charts', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
    case "UI/UX Designer":
    default:
      return [
        { name: 'Figma Baselines & Components', level: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Wireframing Schematics', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'Heuristic Layout Principles', level: 'Intermediate', color: 'bg-indigo-100 text-indigo-700 dark:text-indigo-300' },
        { name: 'HTML & CSS Coding', level: 'Beginner', color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-300' }
      ];
  }
};

const getMissingSkillsDataForRole = (role: string) => {
  switch (role) {
    case "Data Analyst":
      return [
        { name: "DAX Queries", gap: 30, impact: "High Impact" },
        { name: "Pandas Analytics", gap: 35, impact: "High Impact" },
        { name: "Hypothesis Tests", gap: 40, impact: "Medium Impact" },
        { name: "Tableau Stories", gap: 45, impact: "Medium Impact" }
      ];
    case "Frontend Engineer":
      return [
        { name: "Advanced React", gap: 20, impact: "High Impact" },
        { name: "SSR & Next.js", gap: 30, impact: "High Impact" },
        { name: "Zustand State", gap: 40, impact: "Medium Impact" },
        { name: "Unit Testing", gap: 45, impact: "Medium Impact" }
      ];
    case "Full Stack Developer":
      return [
        { name: "GraphQL & API", gap: 25, impact: "High Impact" },
        { name: "Node.js Security", gap: 35, impact: "High Impact" },
        { name: "CI/CD Deployment", gap: 45, impact: "Medium Impact" },
        { name: "Dockerized Swarm", gap: 50, impact: "Medium Impact" }
      ];
    case "AI & ML Engineer":
      return [
        { name: "PyTorch Basics", gap: 25, impact: "High Impact" },
        { name: "Deep Learning Nets", gap: 35, impact: "High Impact" },
        { name: "Vector Databases", gap: 45, impact: "Medium Impact" },
        { name: "FastAPI endpoints", gap: 50, impact: "Medium Impact" }
      ];
    case "Cyber Security Analyst":
      return [
        { name: "Metasploit Scans", gap: 20, impact: "High Impact" },
        { name: "OWASP vulnerability", gap: 35, impact: "High Impact" },
        { name: "SIEM Logs Splunk", gap: 40, impact: "Medium Impact" },
        { name: "Secure TLS Keys", gap: 45, impact: "Medium Impact" }
      ];
    case "Cloud Engineer":
      return [
        { name: "VPC subnet design", gap: 25, impact: "High Impact" },
        { name: "AWS Serverless Lambda", gap: 35, impact: "High Impact" },
        { name: "Kubernetes K8s pods", gap: 40, impact: "Medium Impact" },
        { name: "Terraform IaC script", gap: 45, impact: "Medium Impact" }
      ];
    case "Digital Marketer":
      return [
        { name: "Keyword Planning", gap: 20, impact: "High Impact" },
        { name: "Ad Campaign ROI", gap: 30, impact: "High Impact" },
        { name: "Google Analytics 4", gap: 40, impact: "Medium Impact" },
        { name: "VWO A/B variants", gap: 45, impact: "Medium Impact" }
      ];
    case "Product Manager":
      return [
        { name: "Market Researches", gap: 20, impact: "High Impact" },
        { name: "Roadmap Milestones", gap: 30, impact: "High Impact" },
        { name: "A/B variant tests", gap: 40, impact: "Medium Impact" },
        { name: "Stakeholder Alignment", gap: 45, impact: "Medium Impact" }
      ];
    case "UI/UX Designer":
    default:
      return [
        { name: "UX Research", gap: 20, impact: "High Impact" },
        { name: "Accessibility", gap: 30, impact: "High Impact" },
        { name: "Design Systems", gap: 40, impact: "Medium Impact" },
        { name: "User Testing", gap: 45, impact: "Medium Impact" }
      ];
  }
};

const getJobsForRole = (role: string, resumeScore: number): JobPost[] => {
  switch (role) {
    case "Data Analyst":
      return [
        { id: "nexis_ai", title: "Junior Data Analyst", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹6 - 9 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.05)), skills: ["SQL", "Excel", "Power BI"], applied: false },
        { id: "freshworks", title: "Business Intelligence Developer", company: "Freshworks", location: "Remote", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.98)), skills: ["Python", "SQL", "Tableau"], applied: false },
        { id: "cognizant", title: "Data Analytics Associate", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹5 - 8 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.92)), skills: ["Excel", "Statistics", "R"], applied: false }
      ];
    case "Frontend Engineer":
      return [
        { id: "nexis_ai", title: "Frontend Web Engineer", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹7 - 10 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.05)), skills: ["React", "JavaScript", "HTML/CSS"], applied: false },
        { id: "freshworks", title: "React Developer", company: "Freshworks", location: "Remote", salary: "₹9 - 14 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.98)), skills: ["React", "Tailwind CSS", "Next.js"], applied: false },
        { id: "cognizant", title: "UI Developer", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹6 - 9 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.92)), skills: ["JavaScript", "HTML", "SASS"], applied: false }
      ];
    case "Full Stack Developer":
      return [
        { id: "nexis_ai", title: "Full Stack Engineer (MERN)", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹9 - 14 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.03)), skills: ["Node.js", "React", "MongoDB"], applied: false },
        { id: "freshworks", title: "Software Engineer - Full Stack", company: "Freshworks", location: "Remote", salary: "₹12 - 18 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.98)), skills: ["Node.js", "React", "Docker"], applied: false },
        { id: "cognizant", title: "Full Stack Developer Associate", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹7 - 11 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.91)), skills: ["JavaScript", "Express", "SQL"], applied: false }
      ];
    case "AI & ML Engineer":
      return [
        { id: "nexis_ai", title: "Machine Learning Engineer", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹10 - 15 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.04)), skills: ["Python", "Scikit-learn", "PyTorch"], applied: false },
        { id: "freshworks", title: "AI Integration Engineer", company: "Freshworks", location: "Remote", salary: "₹14 - 20 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.97)), skills: ["OpenAI API", "Python", "Vector DB"], applied: false },
        { id: "cognizant", title: "AI Model Developer", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.91)), skills: ["Python", "TensorFlow", "Math"], applied: false }
      ];
    case "Cyber Security Analyst":
      return [
        { id: "nexis_ai", title: "Information Security Analyst", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.03)), skills: ["TCP/IP", "Linux", "Firewalls"], applied: false },
        { id: "freshworks", title: "Application Security Engineer", company: "Freshworks", location: "Remote", salary: "₹10 - 16 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.97)), skills: ["OWASP", "Penetration Testing", "TLS"], applied: false },
        { id: "cognizant", title: "Cyber Defense Operator", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹6 - 10 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.91)), skills: ["SIEM", "Splunk", "Network Scans"], applied: false }
      ];
    case "Cloud Engineer":
      return [
        { id: "nexis_ai", title: "Cloud Systems Engineer", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹9 - 13 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.02)), skills: ["AWS", "VMs", "IAM"], applied: false },
        { id: "freshworks", title: "DevOps Cloud Specialist", company: "Freshworks", location: "Remote", salary: "₹12 - 18 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.97)), skills: ["Kubernetes", "Docker", "Terraform"], applied: false },
        { id: "cognizant", title: "Cloud Infrastructure Architect", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.91)), skills: ["AWS", "S3 Storage", "VPCs"], applied: false }
      ];
    case "Digital Marketer":
      return [
        { id: "nexis_ai", title: "Digital Marketing Specialist", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹5 - 8 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.04)), skills: ["SEO", "Content Marketing", "Email Funnels"], applied: false },
        { id: "freshworks", title: "Paid Acquisition Manager", company: "Freshworks", location: "Remote", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.97)), skills: ["Google Ads", "Meta Ads", "Analytics"], applied: false },
        { id: "cognizant", title: "SEO Strategist", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹4 - 7 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.91)), skills: ["SEO", "Copywriting", "Keywords"], applied: false }
      ];
    case "Product Manager":
      return [
        { id: "nexis_ai", title: "Associate Product Manager", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹9 - 14 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.03)), skills: ["Agile", "User Research", "Scrum"], applied: false },
        { id: "freshworks", title: "Product Manager - Analytics", company: "Freshworks", location: "Remote", salary: "₹14 - 20 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.98)), skills: ["Roadmapping", "Amplitude", "MVPs"], applied: false },
        { id: "cognizant", title: "Technical Product Owner", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.92)), skills: ["Agile", "PRDs", "Stakeholder Alignment"], applied: false }
      ];
    case "UI/UX Designer":
    default:
      return [
        { id: "nexis_ai", title: "UI/UX Designer", company: "Nexis AI Solutions", location: "Chennai, India (Hybrid)", salary: "₹8 - 12 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.06)), skills: ["Figma", "Design Systems", "HTML", "CSS"], applied: false },
        { id: "freshworks", title: "Product Designer", company: "Freshworks", location: "Remote", salary: "₹10 - 15 LPA", matchScore: Math.min(100, Math.round(resumeScore * 1.02)), skills: ["Prototyping", "User Journeys", "Typography"], applied: false },
        { id: "cognizant", title: "UX Researcher", company: "Cognizant", location: "Bangalore, India (Hybrid)", salary: "₹6 - 10 LPA", matchScore: Math.min(100, Math.round(resumeScore * 0.96)), skills: ["User Testing", "Personas", "Surveys"], applied: false }
      ];
  }
};

interface CandidateWorkspaceProps {
  userEmail: string;
  userName: string;
  userRole: 'student' | 'recruiter' | null;
  onboardingData?: {
    interests: string[];
    skills: string[];
    goal: string;
    recommendedRole: string;
    generatedRoadmap: any;
  } | null;
  onLogout: () => void;
  onNavigateToRecruiter: () => void;
}

export default function CandidateWorkspace({ 
  userEmail, 
  userName, 
  userRole, 
  onboardingData,
  onLogout, 
  onNavigateToRecruiter 
}: CandidateWorkspaceProps) {
  // Navigation: 'home' | 'resume' | 'gap' | 'roadmap' | 'mentor' | 'interview' | 'jobs' | 'profile'
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState<'home' | 'resume' | 'gap' | 'roadmap' | 'mentor' | 'interview' | 'jobs' | 'profile'>('home');
  const [apiStateMode, setApiStateMode] = useState<'ai-generative-live' | 'ai-simulation-offline'>('ai-simulation-offline');
  const [showNotifications, setShowNotifications] = useState(false);
  const [candidateRecord, setCandidateRecord] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  // Check state to inform the candidate of key registration
  useEffect(() => {
    fetch("/api/ai/status")
      .then(r => r.json())
      .then(data => {
        if (data.mode) setApiStateMode(data.mode);
      })
      .catch(() => {});
  }, []);

  // Sync candidate record and company profile from localStorage
  useEffect(() => {
    const syncData = () => {
      try {
        const stored = localStorage.getItem("cs_registered_candidates") || "[]";
        const list = JSON.parse(stored);
        const record = list.find((c: any) => c.email.toLowerCase() === userEmail.toLowerCase());
        if (record) {
          setCandidateRecord(record);
        }
      } catch (e) {}

      try {
        const storedProfile = localStorage.getItem("cs_recruiter_company_profile");
        const defaults = {
          name: "Nexis AI Solutions",
          industry: "Software Development",
          size: "1001-5000",
          website: "https://www.nexisai.io",
          phone: "+91 44 4567 8900",
          email: "recruiter@nexisai.io",
          address: "Tidel Park, Tharamani, Chennai, Tamil Nadu, India"
        };
        if (!storedProfile) {
          setCompanyProfile(defaults);
        } else {
          const parsed = JSON.parse(storedProfile);
          setCompanyProfile({ ...defaults, ...parsed });
        }
      } catch (e) {}
    };

    syncData();
    window.addEventListener("storage", syncData);
    window.addEventListener("focus", syncData);
    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("focus", syncData);
    };
  }, [userEmail, tab]);

  // Sync editable profile fields when candidateRecord shifts
  useEffect(() => {
    if (candidateRecord) {
      if (candidateRecord.name) setEditName(candidateRecord.name);
      if (candidateRecord.phone) setEditPhone(candidateRecord.phone);
      if (candidateRecord.location) setEditLocation(candidateRecord.location);
      if (candidateRecord.degree) setEditDegree(candidateRecord.degree);
      if (candidateRecord.languages) setEditLanguages(candidateRecord.languages);
      
      if (candidateRecord.certificatesCount !== undefined) setCertificatesCount(candidateRecord.certificatesCount);
      if (candidateRecord.projectsCount !== undefined) setProjectsCount(candidateRecord.projectsCount);
      if (candidateRecord.skillsCount !== undefined) setSkillsCount(candidateRecord.skillsCount);
      if (candidateRecord.achievementsCount !== undefined) setAchievementsCount(candidateRecord.achievementsCount);
    }
  }, [candidateRecord]);

  // Helper to enrich milestones with search links if resources are missing
  const getEnrichedRoadmap = (tiers: SyllabusTier[] | null | undefined, roleName: string): SyllabusTier[] => {
    if (!tiers) return [];

    const generateLinks = (title: string, currentYt?: string, currentWeb?: string) => {
      // If it already has a specific URL (not the generic search one), keep it
      if (currentYt && !currentYt.includes('search_query')) return { yt: currentYt, web: currentWeb! };
      
      const t = title.toLowerCase();
      let yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " " + roleName + " tutorial")}`;
      let web = 'https://developer.mozilla.org/en-US/'; // generic fallback docs
      
      if (t.includes('excel')) { web = 'https://support.microsoft.com/en-us/excel'; }
      else if (t.includes('sql')) { web = 'https://www.w3schools.com/sql/'; }
      else if (t.includes('python')) { web = 'https://docs.python.org/3/'; }
      else if (t.includes('power bi')) { web = 'https://learn.microsoft.com/en-us/power-bi/'; }
      else if (t.includes('statistical')) { web = 'https://www.khanacademy.org/math/statistics-probability'; }
      else if (t.includes('tableau') || t.includes('storytelling')) { web = 'https://help.tableau.com/current/pro/desktop/en-us/default.htm'; }
      else if (t.includes('portfolio') || t.includes('github')) { web = 'https://docs.github.com/en'; }
      else if (t.includes('mock interview') || t.includes('drills')) { web = 'https://www.pramp.com/#/'; }
      
      else if (t.includes('html') || t.includes('css')) { web = 'https://developer.mozilla.org/en-US/docs/Web/HTML'; }
      else if (t.includes('javascript') || t.includes('es6')) { web = 'https://javascript.info/'; }
      else if (t.includes('react basics') || t.includes('component')) { web = 'https://react.dev/'; }
      else if (t.includes('tailwind')) { web = 'https://tailwindcss.com/docs/installation'; }
      else if (t.includes('next.js') || t.includes('ssr')) { web = 'https://nextjs.org/docs'; }
      else if (t.includes('zustand') || t.includes('state')) { web = 'https://zustand-demo.pmnd.rs/'; }
      else if (t.includes('testing') || t.includes('unit')) { web = 'https://vitest.dev/'; }
      else if (t.includes('ci/cd') || t.includes('deployment')) { web = 'https://docs.github.com/en/actions'; }
      
      else if (t.includes('linear algebra') || t.includes('math')) { web = 'https://www.khanacademy.org/math/linear-algebra'; }
      else if (t.includes('machine learning') || t.includes('supervised')) { web = 'https://scikit-learn.org/stable/'; }
      else if (t.includes('deep learning') || t.includes('pytorch')) { web = 'https://pytorch.org/tutorials/'; }
      else if (t.includes('llm') || t.includes('generative ai') || t.includes('prompting')) { web = 'https://platform.openai.com/docs/'; }
      else if (t.includes('vector') || t.includes('rag')) { web = 'https://www.pinecone.io/learn/'; }
      else if (t.includes('mlops') || t.includes('fastapi')) { web = 'https://fastapi.tiangolo.com/'; }
      else if (t.includes('mlflow') || t.includes('pipeline')) { web = 'https://mlflow.org/docs/latest/index.html'; }
      
      else if (t.includes('tcp') || t.includes('protocols')) { web = 'https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13769-5.html'; }
      else if (t.includes('linux')) { web = 'https://ubuntu.com/tutorials/command-line-for-beginners'; }
      else if (t.includes('firewall') || t.includes('vpn')) { web = 'https://www.fortinet.com/resources/cyberglossary/what-is-a-firewall'; }
      else if (t.includes('penetration')) { web = 'https://www.metasploit.com/'; }
      else if (t.includes('owasp') || t.includes('security')) { web = 'https://owasp.org/www-project-top-ten/'; }
      else if (t.includes('cryptography')) { web = 'https://en.wikipedia.org/wiki/Cryptography'; }
      else if (t.includes('siem') || t.includes('splunk')) { web = 'https://www.splunk.com/en_us/resources/what-is-siem.html'; }
      
      else if (t.includes('cloud architecture') || t.includes('aws')) { web = 'https://aws.amazon.com/getting-started/'; }
      else if (t.includes('virtual machines') || t.includes('s3')) { web = 'https://docs.aws.amazon.com/ec2/'; }
      else if (t.includes('iam')) { web = 'https://docs.aws.amazon.com/iam/'; }
      else if (t.includes('vpcs') || t.includes('serverless')) { web = 'https://aws.amazon.com/vpc/'; }
      else if (t.includes('docker') || t.includes('kubernetes')) { web = 'https://kubernetes.io/docs/home/'; }
      else if (t.includes('terraform')) { web = 'https://developer.hashicorp.com/terraform/docs'; }
      else if (t.includes('monitoring') || t.includes('logging')) { web = 'https://docs.aws.amazon.com/cloudwatch/'; }
      
      else if (t.includes('digital marketing')) { web = 'https://blog.hubspot.com/marketing/what-is-digital-marketing'; }
      else if (t.includes('content') || t.includes('copywriting')) { web = 'https://copyhackers.com/'; }
      else if (t.includes('seo')) { web = 'https://moz.com/beginners-guide-to-seo'; }
      else if (t.includes('ads') || t.includes('advertising')) { web = 'https://ads.google.com/'; }
      else if (t.includes('analytics 4') || t.includes('ga4')) { web = 'https://analytics.google.com/'; }
      
      else if (t.includes('product management')) { web = 'https://www.atlassian.com/agile/product-management'; }
      else if (t.includes('agile') || t.includes('scrum')) { web = 'https://www.scrum.org/resources/what-is-scrum'; }
      else if (t.includes('prd') || t.includes('research')) { web = 'https://www.productplan.com/glossary/product-requirements-document/'; }
      else if (t.includes('roadmap')) { web = 'https://www.productplan.com/learn/what-is-a-product-roadmap/'; }
      else if (t.includes('product analytics')) { web = 'https://amplitude.com/'; }
      else if (t.includes('stakeholder')) { web = 'https://www.mindtools.com/pages/article/newPPM_07.htm'; }
      
      else if (t.includes('figma')) { web = 'https://help.figma.com/hc/en-us'; }
      else if (t.includes('wireframing')) { web = 'https://balsamiq.com/learn/articles/what-are-wireframes/'; }
      else if (t.includes('ux design') || t.includes('principles')) { web = 'https://www.nngroup.com/articles/ten-usability-heuristics/'; }
      else if (t.includes('design thinking')) { web = 'https://www.interaction-design.org/literature/topics/design-thinking'; }
      else if (t.includes('design systems')) { web = 'https://m3.material.io/'; }
      else if (t.includes('research methods')) { web = 'https://www.nngroup.com/articles/which-ux-research-methods/'; }
      else if (t.includes('prototyping')) { web = 'https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma'; }
      else if (t.includes('usability')) { web = 'https://www.usability.gov/how-to-and-tools/methods/usability-testing.html'; }
      
      else if (t.includes('node.js') || t.includes('express')) { web = 'https://expressjs.com/'; }
      else if (t.includes('nosql') || t.includes('mongodb')) { web = 'https://www.mongodb.com/docs/'; }
      else if (t.includes('token') || t.includes('jwt')) { web = 'https://jwt.io/introduction'; }
      
      else {
        web = `https://www.google.com/search?q=${encodeURIComponent(title + " " + roleName + " documentation")}`;
      }
      
      return { yt, web };
    };

    return tiers.map(tier => ({
      ...tier,
      milestones: tier.milestones.map(ms => {
        const links = generateLinks(ms.title, ms.youtubeUrl, ms.websiteUrl);
        return {
          ...ms,
          youtubeUrl: links.yt,
          websiteUrl: links.web
        };
      })
    }));
  };

  // Shared states
  const [selectedRole, setSelectedRole] = useState(() => onboardingData?.recommendedRole || "UI/UX Designer");
  const [skills, setSkills] = useState(() => onboardingData?.skills || ["FigmaBasics", "Wireframing", "UX Heuristics", "HTML", "JavaScript"]);
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userName || "Yogeshwari");
  const [editPhone, setEditPhone] = useState("+91 98765 43210");
  const [editDegree, setEditDegree] = useState("B.Tech in Information Technology");
  const [editLanguages, setEditLanguages] = useState("English, Tamil, Hindi");
  const [editLocation, setEditLocation] = useState("Chennai, Tamil Nadu, India");
  const [profileBackup, setProfileBackup] = useState<{
    name: string;
    phone: string;
    degree: string;
    languages: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    if (userName) setEditName(userName);
  }, [userName]);

  const handleStartEditing = () => {
    setProfileBackup({
      name: editName,
      phone: editPhone,
      degree: editDegree,
      languages: editLanguages,
      location: editLocation
    });
    setIsEditingProfile(true);
  };

  const handleCancelEditing = () => {
    if (profileBackup) {
      setEditName(profileBackup.name);
      setEditPhone(profileBackup.phone);
      setEditDegree(profileBackup.degree);
      setEditLanguages(profileBackup.languages);
      setEditLocation(profileBackup.location);
    }
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64String = canvas.toDataURL("image/jpeg", 0.7);

          try {
            const stored = localStorage.getItem("cs_registered_candidates") || "[]";
            const list = JSON.parse(stored);
            let userFound = false;
            const updated = list.map((c: any) => {
              if (c.email.toLowerCase() === userEmail.toLowerCase()) {
                userFound = true;
                return { ...c, photo: base64String };
              }
              return c;
            });

            if (!userFound) {
              // If user isn't strictly registered, we can't save it to a specific account, 
              // but we can save it to candidateRecord temporarily.
            } else {
              localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
              window.dispatchEvent(new Event("storage"));
            }
            
            setCandidateRecord(prev => prev ? { ...prev, photo: base64String } : { name: userName, email: userEmail, photo: base64String } as any);
          } catch (err) {
            console.error("Failed to save candidate photo:", err);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    setProfileBackup(null);
    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const updated = list.map((c: any) => {
        if (c.email.toLowerCase() === userEmail.toLowerCase()) {
          return {
            ...c,
            name: editName,
            phone: editPhone,
            location: editLocation,
            degree: editDegree,
            languages: editLanguages
          };
        }
        return c;
      });
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save profile changes to localStorage:", e);
    }
  };

  // ── Interview Answers State & Submit Handler ──
  const [officialAnswers, setOfficialAnswers] = useState<string[]>(["", "", "", "", ""]);
  
  useEffect(() => {
    if (candidateRecord?.officialInterviewAnswers) {
      setOfficialAnswers(candidateRecord.officialInterviewAnswers);
    }
  }, [candidateRecord?.officialInterviewAnswers]);

  const handleSubmitAnswers = () => {
    if (officialAnswers.some(ans => !ans.trim())) return;
    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const updated = list.map((c: any) => {
        if (c.email.toLowerCase() === userEmail.toLowerCase()) {
          return {
            ...c,
            interviewRSVP: 'completed',
            status: 'In Review',
            officialInterviewAnswers: officialAnswers,
            newInterviewAnswersNotification: true
          };
        }
        return c;
      });
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
      setCandidateRecord((prev: any) => prev ? {
        ...prev,
        interviewRSVP: 'completed',
        status: 'In Review',
        officialInterviewAnswers: officialAnswers,
        newInterviewAnswersNotification: true
      } : null);
    } catch (e) {
      console.error(e);
    }
  };
  
  // Dashboard & Roadmap progress states
  const [dashboardProgress, setDashboardProgress] = useState(15);
  const [expandedMilestone, setExpandedMilestone] = useState<{ tierIdx: number; msIdx: number } | null>(null);

  // 11. Resume Analyzer states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeScore, setResumeScore] = useState<number>(88);
  const [resumeFeedback, setResumeFeedback] = useState("Good Job! Your resume is strong and well-aligned with modern UX/UI guidelines. Minor optimization could yield better visibility with ATS checkers.");
  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([
    "Add more quantitative projects highlighting conversion improvements.",
    "Improve keywords containing Figma design systems representation.",
    "Prominently add a Behance portfolio URL index link near top header."
  ]);
  const [certificatesCount, setCertificatesCount] = useState<number>(2);
  const [projectsCount, setProjectsCount] = useState<number>(1);
  const [skillsCount, setSkillsCount] = useState<number>(5);
  const [achievementsCount, setAchievementsCount] = useState<number>(3);
  const [resumeStrengths, setResumeStrengths] = useState<string[]>([
    "General profile structure active",
    "Flexible multi-role paradigm selection",
    "Standard portfolio milestones ready"
  ]);
  const [resumeWeaknesses, setResumeWeaknesses] = useState<string[]>([
    "Resume analyzer upload pending",
    "Score verification details incomplete",
    "Visual project metrics remain to be verified"
  ]);

  // 13. Learning Roadmap Checkboxes
  const [roadmapTiers, setRoadmapTiers] = useState<SyllabusTier[]>(() => {
    if (onboardingData?.generatedRoadmap?.tiers) {
      return getEnrichedRoadmap(onboardingData.generatedRoadmap.tiers, onboardingData.recommendedRole);
    }
    const role = onboardingData?.recommendedRole || "UI/UX Designer";
    return getEnrichedRoadmap(getSyllabusForRole(role), role);
  });

  // Sync roadmap tiers when selectedRole changes
  useEffect(() => {
    if (onboardingData?.recommendedRole === selectedRole && onboardingData?.generatedRoadmap?.tiers) {
      setRoadmapTiers(getEnrichedRoadmap(onboardingData.generatedRoadmap.tiers, selectedRole));
    } else {
      setRoadmapTiers(getEnrichedRoadmap(getSyllabusForRole(selectedRole), selectedRole));
    }
    setExpandedMilestone(null);
  }, [selectedRole, onboardingData]);


  // Calculate overall roadmap progress
  const totalMilestones = roadmapTiers.reduce((acc, tier) => acc + tier.milestones.length, 0);
  const completedMilestones = roadmapTiers.reduce((acc, tier) => acc + tier.milestones.filter(m => m.completed).length, 0);
  const roadmapOverallProgress = Math.round((completedMilestones / totalMilestones) * 100) || 35;

  // Toggle checklist milestones
  const handleToggleMilestone = (tierIndex: number, milestoneIndex: number) => {
    const updated = [...roadmapTiers];
    updated[tierIndex].milestones[milestoneIndex].completed = !updated[tierIndex].milestones[milestoneIndex].completed;
    
    // Recalculate tier progress
    const tier = updated[tierIndex];
    const total = tier.milestones.length;
    const completed = tier.milestones.filter(m => m.completed).length;
    tier.progress = Math.round((completed / total) * 100);
    
    setRoadmapTiers(updated);
  };

  // 14. AI Mentor States
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (userEmail) {
      const storedChats = localStorage.getItem(`cs_mentor_chat_${userEmail}`);
      if (storedChats) {
        setMessages(JSON.parse(storedChats));
      } else {
        setMessages([
          { id: "1", sender: "ai", text: `Hello ${userName || 'there'}! I am your AI Career Coach. How can I help you accelerate your journey into your chosen career today?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    }
  }, [userEmail, userName]);
  const [msgInput, setMsgInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // 15-16. Mock Interview states - moved into MockInterviewPortal component

  // 17. Job Matching board filters
  const [jobFilter, setJobFilter] = useState<'Recommended' | 'Saved' | 'Applied'>('Recommended');
  const [jobPosts, setJobPosts] = useState<JobPost[]>(() => getJobsForRole("UI/UX Designer", 88));

  // Sync jobs from Firestore
  useEffect(() => {
    const q = collection(db, 'jobs');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fsJobs = snapshot.docs.filter(doc => doc.data().isActive !== false && doc.data().role === selectedRole).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.role,
          company: data.company || "Unknown",
          location: data.location || "Remote",
          salary: data.salary || "N/A",
          matchScore: Math.min(100, Math.round((dashboardProgress || 88) * 1.05)),
          skills: data.skills || [],
          applied: false
        };
      });
      
      setJobPosts(prev => {
        const staticJobs = getJobsForRole(selectedRole, dashboardProgress || 88);
        // keep static ones and prepend fsJobs
        return [...fsJobs, ...staticJobs];
      });
    });
    return () => unsubscribe();
  }, [selectedRole, dashboardProgress]);

  useEffect(() => {
    setJobPosts(prev => {
      const fresh = getJobsForRole(selectedRole, resumeScore);
      let recruiterCompanyName = "Nexis AI Solutions";
      try {
        const stored = localStorage.getItem('cs_recruiter_company_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) recruiterCompanyName = parsed.name;
        }
      } catch (e) {}

            const fsJobsFromPrev = prev.filter(p => !fresh.some(f => f.id === p.id));
      
      const updatedFresh = fresh.map(fJob => {
        let updatedJob = { ...fJob };
        if (updatedJob.company === "Nexis AI Solutions" || updatedJob.id === 'nexis_ai') {
          updatedJob.company = recruiterCompanyName;
        }
        const found = prev.find(p => p.id === fJob.id);
        if (found) {
          updatedJob.applied = found.applied;
        }
        return updatedJob;
      });

      return [...fsJobsFromPrev, ...updatedFresh];
    });
  }, [selectedRole, resumeScore, tab]);

  // Skill Gap metrics
  const missingSkillsData = [
    { name: "UX Research", gap: 20, impact: "High Impact" },
    { name: "Accessibility", gap: 30, impact: "High Impact" },
    { name: "Design Systems", gap: 40, impact: "Medium Impact" },
    { name: "User Testing", gap: 45, impact: "Medium Impact" }
  ];

  // Helper: Submit message to AI Mentor
  const handleSendMentorMessage = async (alternativePrompt?: string) => {
    const textToSend = alternativePrompt || msgInput;
    if (!textToSend.trim() || sendingMsg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    localStorage.setItem(`cs_mentor_chat_${userEmail}`, JSON.stringify(newMsgs));
    setMsgInput("");
    setSendingMsg(true);

    try {
      const response = await fetch("/api/ai/chat-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          selectedRole,
          userSkills: skills
        })
      });

      const data = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      localStorage.setItem(`cs_mentor_chat_${userEmail}`, JSON.stringify(finalMsgs));
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  // Helper: Simulate File Dropping
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUploadedResumeFile = async (file: File) => {
    setUploadedFile(file);
    setAnalyzingResume(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const response = await fetch("/api/ai/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64Data,
            mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            skills,
            role: selectedRole
          })
        });

        const data = await response.json();
        setResumeScore(data.score);
        setResumeFeedback(data.feedback);
        setResumeSuggestions(data.suggestions);
        setDashboardProgress(data.score);
        
        if (data.certificatesCount !== undefined) setCertificatesCount(data.certificatesCount);
        if (data.projectsCount !== undefined) setProjectsCount(data.projectsCount);
        if (data.skillsCount !== undefined) setSkillsCount(data.skillsCount);
        if (data.achievementsCount !== undefined) setAchievementsCount(data.achievementsCount);
        if (data.strengths) setResumeStrengths(data.strengths);
        if (data.weaknesses) setResumeWeaknesses(data.weaknesses);

        // Update resume details in cs_registered_candidates list in localStorage
        try {
          // Because Storage requires a paid plan, we will save the base64 directly to Firestore!
          // Note: Works well for resumes under 700KB.
          await updateDoc(doc(db, "candidates", userEmail.toLowerCase()), {
            resumeScore: data.score,
            match: data.score,
            status: data.score >= 80 ? "Shortlisted" : "In Review",
            resumeFileName: file.name,
            resumeFileData: reader.result as string, 
            certificatesCount: data.certificatesCount,
            projectsCount: data.projectsCount,
            skillsCount: data.skillsCount,
            achievementsCount: data.achievementsCount
          });
        } catch (e) {
          console.error("Failed to update candidate resume details:", e);
        }
      } catch (e) {
        console.error("Failed to analyze resume file:", e);
      } finally {
        setAnalyzingResume(false);
      }
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      setAnalyzingResume(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedResumeFile(e.dataTransfer.files[0]);
    }
  };

  // Interview handlers moved to MockInterviewPortal component

    const handleCancelApplication = (jobId: string) => {
    if (!confirm("Are you sure you want to cancel your application?")) return;
    
    setJobPosts(prev => 
      prev.map(j => j.id === jobId ? { ...j, applied: false } : j)
    );

    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const updated = list.map((c: any) => {
        if (c.email.toLowerCase() === userEmail.toLowerCase()) {
          return { 
            ...c, 
            appliedJobTitle: null,
            appliedJobCompany: null,
            appliedJobId: null,
            newApplicationNotification: false,
            status: null
          };
        }
        return c;
      });
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
      
      setCandidateRecord((prev: any) => prev ? {
        ...prev,
        appliedJobTitle: null,
        appliedJobCompany: null,
        appliedJobId: null,
        newApplicationNotification: false,
        status: null
      } : null);
    } catch (e) {
      console.error("Failed to cancel application details:", e);
    }
  };

  const handleApplyToJob = (jobId: string) => {
    const job = jobPosts.find(j => j.id === jobId);
    if (!job) return;

    setJobPosts(prev => 
      prev.map(j => j.id === jobId ? { ...j, applied: true } : j)
    );

    // Update candidate record in cs_registered_candidates list in localStorage
    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const updated = list.map((c: any) => {
        if (c.email.toLowerCase() === userEmail.toLowerCase()) {
          return { 
            ...c, 
            appliedJobTitle: job.title,
            appliedJobCompany: job.company,
            appliedJobId: job.id,
            newApplicationNotification: true,
            status: "Applied"
          };
        }
        return c;
      });
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update applied job details:", e);
    }
  };

  return (<div className={isDark ? 'dark' : ''} id="candidate-workspace"><div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] dark:bg-gradient-to-br dark:from-[#0A0A0A] dark:via-[#1a103c] dark:to-[#0A0A0A] text-slate-900 dark:text-slate-200 flex flex-col md:flex-row selection:bg-purple-500/30 font-sans relative overflow-x-hidden">
      <AntiGravityParticles />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#14183B]/[0.02] backdrop-blur-xl text-slate-700 dark:text-slate-300 flex flex-col shrink-0 text-slate-900 dark:text-white z-10 border-r border-slate-200 dark:border-white/10">
        
        {/* Core Company Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#14183B] border border-purple-500/30 flex items-center justify-center shadow-md dark:shadow-xl dark:shadow-purple-500/20 overflow-hidden relative">
            <svg className="w-6.5 h-6.5 drop-shadow-[0_0_4px_rgba(99,66,232,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="innovative-logo-grad-cand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="url(#innovative-logo-grad-cand)" strokeWidth="2" strokeDasharray="12 6" style={{ animation: "spin 12s linear infinite" }} />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-cand)" strokeWidth="2" transform="rotate(-45 50 50)" opacity="0.75" />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-cand)" strokeWidth="2" transform="rotate(45 50 50)" opacity="0.75" />
              <circle cx="50" cy="50" r="18" fill="#14183B" stroke="url(#innovative-logo-grad-cand)" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="12" fill="url(#innovative-logo-grad-cand)" opacity="0.15" className="animate-pulse" />
              <text x="50" y="57" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">C</text>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight flex-1">CareerSphere AI</h1>
            <button className="md:hidden p-1.5 hover:bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] font-mono tracking-widest text-[#6.342e8] text-purple-400 block uppercase">Candidate Core</span>
          </div>
        </div>



        {/* Nav list */}
        <nav className="flex-1 p-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'home', label: 'Dashboard Home', icon: Home },
            { id: 'resume', label: 'Resume Analyzer', icon: FileText },
            { id: 'gap', label: 'Skill Gap Analysis', icon: BarChart3 },
            { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
            { id: 'mentor', label: 'AI Mentor Chat', icon: MessageSquare },
            { id: 'interview', label: 'Mock Interview Portal', icon: Award },
            { id: 'jobs', label: 'Job Matching', icon: Briefcase },
            { id: 'profile', label: 'My Profile', icon: User }
          ].map((navItem) => {
            const NavIcon = navItem.icon;
            const isSelected = tab === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => { setTab(navItem.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected ? "bg-[#6342E8] text-white shadow-sm dark:shadow-lg dark:shadow-purple-500/10" : "text-slate-450 text-slate-700 dark:text-slate-300 hover:bg-white dark:bg-[#14183B]/5 hover:text-slate-900 dark:text-white"
                }`}
              >
                <NavIcon className="w-4 h-4 shrink-0 stroke-[2]" />
                <span>{navItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Portal Switcher */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          {userRole !== 'student' && (
            <button
              id="btn-switch-recruiter-portal"
              onClick={onNavigateToRecruiter}
              className="w-full bg-[#1D174F] hover:bg-slate-800 text-purple-300 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-purple-500/10 text-[11px] py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter Portal →</span>
            </button>
          )}
          
          <button 
            id="btn-logout"
            onClick={onLogout}
            className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-rose-400 text-[10px] uppercase font-mono tracking-widest block transition-all"
          >
            Logout session
          </button>
        </div>

      </aside>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CORE WORKSPACE CONSOLE */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen" id="candidate-console">
        
        {/* TOP GREETING BANNER STATUS */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-transparent z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">CareerSphere</span>
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 bg-slate-100 dark:bg-purple-500/20 text-slate-700 dark:text-purple-400 rounded-lg hover:bg-slate-200 dark:hover:bg-purple-500/30">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <header className="bg-white dark:bg-[#14183B]/[0.02] backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 py-3 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"><Menu className="w-4 h-4" /></button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all"><AnimatePresence mode="wait"><motion.div key={isDark ? 'dark' : 'light'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</motion.div></AnimatePresence></button>
            <span className="text-purple-300 font-bold text-xs shrink-0">{selectedRole} Track</span>
          </div>

          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            {/* Target Role Selector */}
            <button onClick={() => setIsDark(!isDark)} className="hidden md:flex p-2 bg-slate-100 dark:bg-purple-500/20 text-slate-700 dark:text-purple-400 rounded-lg hover:bg-slate-200 dark:hover:bg-purple-500/30 mr-2">
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
    <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">ROLE:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-white dark:bg-[#14183B]/5 border border-white/15 text-slate-900 dark:text-white rounded-lg text-xs font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="UI/UX Designer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">UI/UX Designer</option>
                <option value="Data Analyst" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Data Analyst</option>
                <option value="Frontend Engineer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Frontend Engineer</option>
                <option value="Full Stack Developer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Full Stack Developer</option>
                <option value="AI & ML Engineer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">AI & ML Engineer</option>
                <option value="Cyber Security Analyst" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Cyber Security Analyst</option>
                <option value="Cloud Engineer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Cloud Engineer</option>
                <option value="Digital Marketer" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Digital Marketer</option>
                <option value="Product Manager" className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-white">Product Manager</option>
              </select>
            </div>

            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-1.5 hover:bg-white dark:bg-[#14183B]/10 rounded-full cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <Bell className="w-4 h-4" />
              {candidateRecord?.emails && candidateRecord.emails.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full"></span>
              )}
            </button>
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4">
              <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center font-extrabold text-xs text-purple-300 overflow-hidden">
                {candidateRecord?.photo ? (
                  <img src={candidateRecord.photo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  editName ? editName.charAt(0).toUpperCase() : "Y"
                )}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{editName}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">Candidate Profile</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT SHEETS */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">

            {/* TAB: HOME DASHBOARD */}
            {tab === 'home' && (
              <motion.div 
                key="home" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Greet segment */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Hello {editName} 👋</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Ready to achieve your career objectives today? Here is your personalized tracking metrics.</p>
                  </div>
                  <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-2 px-4 rounded-xl flex items-center gap-2 text-xs text-slate-500 select-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-50 dark:bg-emerald-900/300"></span>
                    <span>Target Goal: <strong className="text-slate-800 dark:text-slate-200">{selectedRole} Position</strong></span>
                  </div>
                </div>

                {/* Dashboard layout core widgets */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Readiness Banner Gauges (Left Side, Span 8) */}
                  <div className="md:col-span-8 space-y-6">
                    
                    {/* Career Readiness Score Banner Card */}
                    <div className="bg-gradient-to-r from-[#6342E8] to-[#4323d4] text-slate-900 dark:text-white p-6 rounded-2xl relative overflow-hidden shadow-xl shadow-purple-500/10 flex flex-col sm:flex-row gap-6 items-center">
                      {/* Gauge */}
                      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#38bdf8" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * dashboardProgress) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xl font-extrabold text-sky-300">{dashboardProgress}%</span>
                          <span className="text-[8px] text-slate-700 dark:text-slate-300 tracking-wider">READINESS</span>
                        </div>
                      </div>

                      {/* Info and mini graph */}
                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        <span className="inline-block bg-white dark:bg-[#14183B]/20 text-slate-900 dark:text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">Active Phase</span>
                        <h3 className="text-lg font-extrabold tracking-tight">Great Progress! You are on the right track</h3>
                        <p className="text-xs text-purple-200 leading-relaxed max-w-sm">
                          Your profile matching indicators show exceptional synergy with top tiers. Complete intermediate design systems and draft mock interview 2 to score 90%+.
                        </p>
                      </div>
                    </div>

                     {/* Applied Job & Company Profile Details */}
                    {companyProfile && (
                      <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm dark:shadow-lg dark:shadow-purple-500/10 text-slate-800 dark:text-slate-200">
                        {candidateRecord?.appliedJobTitle ? (
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex gap-3.5 items-center">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center font-extrabold italic text-[#6342E8] font-mono select-none shrink-0">
                                {(candidateRecord.appliedJobCompany || companyProfile.name).substring(0, 1)}
                              </div>
                              <div>
                                <span className="text-[9px] text-[#6342E8] uppercase font-bold tracking-widest block font-mono">Applied Position</span>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{candidateRecord.appliedJobTitle}</h4>
                                <span className="text-xs text-slate-500 font-semibold">at {candidateRecord.appliedJobCompany || companyProfile.name}</span>
                              </div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                              candidateRecord.status === 'Hired' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              candidateRecord.status === 'Shortlisted' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50' :
                              candidateRecord.status === 'Rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50' :
                              'bg-purple-50 dark:bg-purple-900/30 text-purple-750 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50'
                            }`}>
                              Status: {candidateRecord.status === 'Hired' ? '✓ Hired' : candidateRecord.status}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex gap-3.5 items-center">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center font-extrabold italic text-[#6342E8] font-mono select-none shrink-0">
                                {companyProfile.name.substring(0, 1)}
                              </div>
                              <div>
                                <span className="text-[9px] text-[#6342E8] uppercase font-bold tracking-widest block font-mono">Corporate Hiring Partner</span>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{companyProfile.name}</h4>
                                <span className="text-xs text-slate-500 font-semibold">Explore active job opportunities below</span>
                              </div>
                            </div>
                            <button
                              onClick={() => { setTab('jobs'); setIsSidebarOpen(false); }}
                              className="bg-purple-100 hover:bg-purple-200 text-[#6342E8] font-extrabold px-3.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer active:scale-95"
                            >
                              View Openings →
                            </button>
                          </div>
                        )}

                        {/* Company Profile Details */}
                        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-600 dark:text-slate-400 font-bold uppercase pb-1.5 border-b border-slate-200 dark:border-white/10/60">
                            <span>Corporate Details</span>
                            <span className="text-purple-600 dark:text-purple-400 font-extrabold">{companyProfile.industry}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Headquarters Location</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.address}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Website URI</span>
                              <a href={companyProfile.website} target="_blank" rel="noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{companyProfile.website.replace('https://','')}</a>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Employee size bracket</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.size} employees</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Talent Contact info</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.email} ({companyProfile.phone})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Access Actions Icons Grid */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-widest uppercase font-mono">Quick Actions Hub</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { title: 'Resume Analyzer', desc: 'Score your CV', tab: 'resume', icon: FileText, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:border-blue-300' },
                          { title: 'Skill Gaps', desc: 'Find missing items', tab: 'gap', icon: BarChart3, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:border-emerald-300' },
                          { title: 'AI Mock Drill', desc: 'Pitch simulation', tab: 'interview', icon: Award, color: 'bg-yellow-50 text-yellow-600 hover:border-yellow-300' },
                          { title: 'AI Mentor Chat', desc: 'Ask career query', tab: 'mentor', icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:border-purple-300' }
                        ].map((action, idx) => {
                          const ActionIcon = action.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => { setTab(action.tab as any); setIsSidebarOpen(false); }}
                              className={`p-4 rounded-xl text-center border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14183B] transition-all scale-active cursor-pointer ${action.color}`}
                            >
                              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-white dark:bg-[#14183B] border border-slate-100 dark:border-white/5 shadow-xs mb-3">
                                <ActionIcon className="w-5 h-5 stroke-[2]" />
                              </div>
                              <span className="font-extrabold text-xs block text-slate-800 dark:text-slate-200">{action.title}</span>
                              <span className="text-[9px] text-slate-600 dark:text-slate-400 mt-1 block">{action.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Highly Recommended Card (Screen 10 showcase banner) */}
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-center">
                      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center font-black text-xl italic text-[#6342E8] shrink-0">
                        C
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <span className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-widest block">Spotlight Track</span>
                        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Your Recommended Career Profile: {selectedRole}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[400px]">
                          Matches 96% of items declared in onboarding. Highlight your knowledge with interactive components and Figma variable scales.
                        </p>
                      </div>
                      <button 
                        onClick={() => { setTab('jobs'); setIsSidebarOpen(false); }}
                        className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex gap-1.5 items-center transition-all shrink-0 cursor-pointer"
                      >
                        Find matched jobs <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Sidebar Widgets (Right Side, Span 4) */}
                  <div className="md:col-span-4 space-y-6">
                    
                    {/* Active Learning Progress meters */}
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-[#6342E8]" />
                          <span>Learning Progress</span>
                        </h4>
                        <button onClick={() => { setTab('roadmap'); setIsSidebarOpen(false); }} className="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline">Syllabus →</button>
                      </div>

                      <div className="space-y-3.5">
                        {getLearningProgressForRole(selectedRole).map((lp, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              <span>{lp.skill}</span>
                              <span className="font-bold">{lp.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className={`${lp.color} h-full rounded-full`} style={{ width: `${lp.progress}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Coach Suggestion bubble widget */}
                    <div className="bg-[#1D174F] text-slate-900 dark:text-white p-4 rounded-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-3">
                        <span className="text-[8px] font-mono tracking-widest text-[#38bdf8] uppercase block">AI Mentor Prompt</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic">"How do I craft design files that recruiters love?"</p>
                        <button 
                          onClick={() => {
                            setTab('mentor'); setIsSidebarOpen(false);
                            handleSendMentorMessage("How do I craft design files that recruiters love?");
                          }}
                          className="w-full bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          Ask AI Mentor Now
                        </button>
                      </div>
                      {/* background glow */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full blur-xl"></div>
                    </div>

                  </div>
                </div>
                {/* Interview RSVP Banner — shown when recruiter has scheduled an interview */}
                {candidateRecord?.scheduledDate && candidateRecord?.interviewRSVP === 'pending' && (() => {
                  const formatted = new Date(`${candidateRecord.scheduledDate}T${candidateRecord.scheduledTime || '10:00'}`).toLocaleString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                  });
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 border border-blue-400/30 rounded-2xl p-5 text-slate-900 dark:text-white shadow-xl shadow-blue-500/20"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="w-10 h-10 bg-white dark:bg-[#14183B]/20 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xl">📅</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-[9px] font-mono tracking-widest uppercase text-blue-200 font-bold block">Interview Invitation — RSVP Required</span>
                          <h4 className="font-extrabold text-sm mt-0.5">
                            {candidateRecord.appliedJobCompany || 'Nexis AI Solutions'} — {formatted}
                          </h4>
                          <p className="text-xs text-blue-200 mt-1">
                            📍 {candidateRecord.scheduledVenue || 'Nexis AI Solutions, Tidel Park, Tharamani, Chennai'}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              try {
                                const stored = localStorage.getItem('cs_registered_candidates') || '[]';
                                const list = JSON.parse(stored);
                                const updated = list.map((c: any) =>
                                  c.email?.toLowerCase() === userEmail?.toLowerCase()
                                    ? { ...c, interviewRSVP: 'confirmed' }
                                    : c
                                );
                                localStorage.setItem('cs_registered_candidates', JSON.stringify(updated));
                                setCandidateRecord((prev: any) => ({ ...prev, interviewRSVP: 'confirmed' }));
                              } catch (e) {}
                            }}
                            className="bg-white dark:bg-[#14183B] text-blue-700 dark:text-blue-300 font-extrabold px-3 py-2 rounded-xl text-xs hover:bg-blue-50 dark:bg-blue-900/30 transition-all cursor-pointer active:scale-95 shadow-md dark:shadow-xl dark:shadow-purple-500/20"
                          >
                            ✓ Confirm Attendance
                          </button>
                          <button
                            onClick={() => {
                              try {
                                const stored = localStorage.getItem('cs_registered_candidates') || '[]';
                                const list = JSON.parse(stored);
                                const updated = list.map((c: any) =>
                                  c.email?.toLowerCase() === userEmail?.toLowerCase()
                                    ? { ...c, interviewRSVP: 'reschedule' }
                                    : c
                                );
                                localStorage.setItem('cs_registered_candidates', JSON.stringify(updated));
                                setCandidateRecord((prev: any) => ({ ...prev, interviewRSVP: 'reschedule' }));
                              } catch (e) {}
                            }}
                            className="bg-white dark:bg-[#14183B]/20 hover:bg-white dark:bg-[#14183B]/30 text-slate-900 dark:text-white font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                          >
                            Request Reschedule
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Interview RSVP Confirmed badge */}
                {candidateRecord?.scheduledDate && candidateRecord?.interviewRSVP === 'confirmed' && (
                  <div className="space-y-4">
                    <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-emerald-300">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <div>
                          <span className="font-bold text-sm block">Attendance Confirmed!</span>
                          <span className="text-xs text-emerald-400">Your interview is confirmed for {candidateRecord.scheduledDate} at {candidateRecord.scheduledTime}. Good luck! 🎉</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setTab('interview'); setIsSidebarOpen(false); }}
                        className="bg-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/300 text-slate-900 dark:text-white font-extrabold px-4.5 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-md dark:shadow-xl dark:shadow-purple-500/20"
                      >
                        🚀 Start Scheduled Interview
                      </button>
                    </div>

                    {candidateRecord?.officialInterviewQuestions && (
                      <div className="bg-white dark:bg-[#14183B]/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 mt-4 space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider font-mono uppercase flex items-center gap-2">
                          <span>📝</span> Online Interview Q&A Sheet
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Please read and answer the following 5 custom interview questions generated for your role (**{candidateRecord.role || 'UI/UX Designer'}**). Submit them to send your answers to the recruiter for review.
                        </p>
                        <div className="space-y-4 pt-2">
                          {candidateRecord.officialInterviewQuestions.map((q: string, i: number) => (
                            <div key={i} className="space-y-2">
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{i + 1}. {q}</label>
                              <textarea
                                rows={3}
                                value={officialAnswers[i] || ''}
                                onChange={(e) => {
                                  const updated = [...officialAnswers];
                                  updated[i] = e.target.value;
                                  setOfficialAnswers(updated);
                                }}
                                placeholder="Type your detailed answer here..."
                                className="w-full bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={handleSubmitAnswers}
                            disabled={officialAnswers.some(ans => !ans.trim())}
                            className="bg-[#6342E8] hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 dark:text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-md dark:shadow-xl dark:shadow-purple-500/20 flex items-center gap-2"
                          >
                            🚀 Submit Interview Answers
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview RSVP Reschedule badge */}
                {candidateRecord?.scheduledDate && candidateRecord?.interviewRSVP === 'reschedule' && (
                  <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-300">
                    <span className="text-lg">⏳</span>
                    <div>
                      <span className="font-bold text-sm block">Reschedule Request Sent</span>
                      <span className="text-xs text-amber-400">Your reschedule request has been noted. The recruiter will contact you soon.</span>
                    </div>
                  </div>
                )}

                {/* Official Interview Completed badge */}
                {candidateRecord?.scheduledDate && candidateRecord?.interviewRSVP === 'completed' && (() => {
                  const score = candidateRecord.officialInterviewResult?.score;
                  const isApproved = candidateRecord.officialInterviewResult?.approvedOrRejected === 'Approved' || candidateRecord.status === 'Shortlisted' || candidateRecord.status === 'Hired';
                  const isRejected = candidateRecord.officialInterviewResult?.approvedOrRejected === 'Rejected' || candidateRecord.status === 'Rejected';
                  const statusText = isApproved ? 'Approved ✓' : isRejected ? 'Rejected' : 'Pending Evaluation';
                  const badgeColor = isApproved ? 'bg-emerald-950/45 border-emerald-500/30 text-emerald-300' : isRejected ? 'bg-rose-950/45 border-rose-500/30 text-rose-300' : 'bg-purple-950/45 border-purple-500/30 text-purple-300';
                  return (
                    <div className={`${badgeColor} border rounded-2xl p-5 space-y-3`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">📝</span>
                          <div>
                            <span className="font-bold text-sm block">Official Interview Completed</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">Submitted on {candidateRecord.officialInterviewResult?.date || candidateRecord.scheduledDate}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isApproved ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-450 text-emerald-300' : isRejected ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-305 text-rose-300' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-400 text-purple-300'
                        }`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="pt-2.5 border-t border-slate-200 dark:border-white/10 text-xs flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Performance Score: <strong className="text-slate-900 dark:text-white font-mono">{score || 0}%</strong></span>
                        {isApproved ? (
                          <span className="text-emerald-450 text-emerald-300 font-extrabold">Offer release in progress! 🎉</span>
                        ) : isRejected ? (
                          <span className="text-rose-455 text-rose-400 font-bold">Interview Completed. We regret to inform you...</span>
                        ) : (
                          <span className="text-purple-355 text-purple-300 font-bold">Pending feedback from Talent Team.</span>
                        )}
                      </div></div>);
                })()}

              </motion.div>
            )}

            {/* TAB: RESUME ANALYZER (Screen 11) */}
            {tab === 'resume' && (
              <motion.div 
                key="resume"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Resume Analyzer</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Submit your professional PDF or DOCX file to run advanced layout and semantic check metrics against the target {selectedRole} role.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Upload area widget (Column 7) */}
                  <div className="md:col-span-7 space-y-6">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`bg-white dark:bg-[#14183B] border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] transition-all relative ${
                        dragActive ? "border-[#6342E8] bg-purple-50 dark:bg-purple-900/30/40" : "border-slate-250 cursor-pointer hover:border-[#6342E8]"
                      }`}
                    >
                      {/* Upload UI elements */}
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-full text-[#6342E8] mb-4">
                        <Upload className="w-8 h-8 animate-bounce" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Drag and drop your file here to analyze</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mb-6">Supports PDF or DOCX format. Max layout upload cap 5MB.</p>

                      <label className="bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer">
                        Choose File
                        <input 
                          type="file" 
                          accept=".pdf,.docx" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processUploadedResumeFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      {uploadedFile && (
                        <div className="mt-4 p-2 px-4 bg-slate-100 dark:bg-white/10 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}

                      {analyzingResume && (
                        <div className="absolute inset-0 bg-white dark:bg-[#14183B]/80 rounded-2xl flex flex-col items-center justify-center p-4">
                          <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 bg-[#6342E8]/20 rounded-full animate-ping"></div>
                            <div className="absolute -inset-1 bg-[#6342E8]/10 rounded-full animate-spin border-t-2 border-[#6342E8]"></div>
                            <FileText className="w-6 h-6 text-[#6342E8]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 animate-pulse">Running advanced AI ATS heuristics...</span>
                        </div>
                      )}
                    </div>

                    {/* suggestions list */}
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Actionable Suggestions</h4>
                      <div className="space-y-3">
                        {resumeSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                            <span className="w-5 h-5 bg-purple-100 text-[#6342E8] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{index + 1}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core scoring gauge output (Column 5) */}
                  <div className="md:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-6 rounded-2xl text-center space-y-4 shadow-xs">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 block">AI Resume Quality Score</span>

                      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="rgba(0,0,0,0.05)" strokeWidth="8" fill="transparent" />
                          <circle cx="64" cy="64" r="54" stroke="#6342E8" strokeWidth="8" fill="transparent" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * resumeScore) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute">
                          <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{resumeScore}</span>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 block mt-0.5">/ 100</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="bg-purple-100 text-[#6342E8] text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto inline-block">
                          {resumeScore >= 80 ? "Highly Relevant Resume" : "Needs Layout Refinements"}
                        </span>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto pt-2">
                          {resumeFeedback}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => {
                            setTab('roadmap'); setIsSidebarOpen(false);
                          }}
                          className="w-full bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white font-bold py-2.5 rounded-xl text-xs transition-all"
                        >
                          Improve Resume via Learning →
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: SKILL GAP (Screen 12) */}
            {tab === 'gap' && (
              <motion.div 
                key="gap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Skill Gap Analyzer</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Evaluates declared skills against industrial demands for {selectedRole} tracks.</p>
                  </div>
                  <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs flex gap-2 items-center">
                    <span className="font-mono text-slate-600 dark:text-slate-400">TARGET:</span>
                    <strong className="text-slate-850 text-slate-705 text-slate-800 dark:text-slate-200">{selectedRole}</strong>
                    <button 
                      onClick={() => {
                        const rolesList = [
                          "UI/UX Designer",
                          "Data Analyst",
                          "Frontend Engineer",
                          "AI & ML Engineer",
                          "Cyber Security Analyst",
                          "Cloud Engineer",
                          "Digital Marketer",
                          "Product Manager"
                        ];
                        const currentIndex = rolesList.indexOf(selectedRole);
                        const nextIndex = (currentIndex + 1) % rolesList.length;
                        setSelectedRole(rolesList[nextIndex]);
                      }} 
                      className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      Change Role
                    </button>
                  </div>
                </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Declared list of skills (Column 5) */}
                  <div className="md:col-span-5 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-widest font-mono">Skills You Have Already Learned (Completed)</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">You have successfully completed and validated these skills on your profile.</p>
                    <div className="space-y-2.5">
                      {getCurrentSkillsForRole(selectedRole).map((item, i) => (
                        <div key={i} className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center text-xs text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            <span className="font-bold">{item.name}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.color}`}>{item.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Gap charts (Column 7) */}
                  <div className="md:col-span-7 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-slate-850 uppercase tracking-widest font-mono">Skills You Still Need to Learn (Remaining Gaps)</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">These skills are required for the target {selectedRole} role and need to be acquired.</p>
                    
                    {/* Recharts vertical Column distribution graph */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getMissingSkillsDataForRole(selectedRole)}
                          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value) => [`Missing Gap: ${value}%`, 'Relevance']} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="gap" name="Percentage Gap" fill="#6342E8" radius={[4, 4, 0, 0]}>
                            {getMissingSkillsDataForRole(selectedRole).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6342E8" : "#818cf8"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Remaining learning checklist */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-left">
                      <span className="text-[9px] font-mono tracking-wider text-slate-600 dark:text-slate-400 uppercase block font-bold">Remaining Learning Checklist</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getMissingSkillsDataForRole(selectedRole).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 p-2.5 bg-amber-50 dark:bg-amber-900/30/40 border border-amber-100 dark:border-amber-800/50 rounded-lg text-xs text-amber-900 font-bold">
                            <span className="w-1.5 h-1.5 bg-amber-50 dark:bg-amber-900/300 rounded-full shrink-0"></span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setTab('roadmap'); setIsSidebarOpen(false);
                        }}
                        className="w-full bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Generate roadmap to bypass gaps <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                      </button>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: LEARNING ROADMAP (Screen 13) */}
            {tab === 'roadmap' && (
              <motion.div 
                key="roadmap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Personalized Learning Roadmap</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Custom chronological step-by-step curriculum generated specifically for your onboarding selections.</p>
                  </div>
                  
                  {/* Progress tracker summary */}
                  <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-xs flex items-center gap-4 shadow-xs">
                    <span className="font-bold text-slate-500 font-mono">ROADMAP PROGRESS:</span>
                    <strong className="text-[#6342E8] font-black text-sm">{roadmapOverallProgress}%</strong>
                    <div className="w-24 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden border border-slate-205">
                      <div className="bg-[#6342E8] h-full" style={{ width: `${roadmapOverallProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid Tiers */}
                <div className="space-y-6 relative border-l-2 border-purple-100 dark:border-purple-800/50 pl-6 ml-4">
                  {roadmapTiers.map((tier, tierIdx) => (
                    <div key={tierIdx} className="relative space-y-3">
                      
                      {/* Node circle milestone icon absolute positioning */}
                      <div className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border-2 bg-white dark:bg-[#14183B] flex items-center justify-center font-bold text-xs ${
                        tier.progress === 100 ? "border-emerald-500 text-emerald-500" : "border-[#6342E8] text-[#6342E8]"
                      }`}>
                        {tier.progress === 100 ? "✓" : tierIdx + 1}
                      </div>

                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                        <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-[#6342E8] border border-purple-100 dark:border-purple-800/50 px-2.5 py-0.5 rounded-full font-bold">
                          {tier.progress}% Completed
                        </span>
                      </div>

                      {/* Milestones listed inside glass card */}
                      <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-5 space-y-3 shadow-xs">
                        {tier.milestones.map((milestone, msIdx) => {
                          const isExpanded = expandedMilestone?.tierIdx === tierIdx && expandedMilestone?.msIdx === msIdx;
                          return (
                            <div 
                              key={msIdx} 
                              onClick={() => {
                                if (expandedMilestone?.tierIdx === tierIdx && expandedMilestone?.msIdx === msIdx) {
                                  setExpandedMilestone(null);
                                } else {
                                  setExpandedMilestone({ tierIdx, msIdx });
                                }
                              }}
                              className={`p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:bg-white/10/60 rounded-xl border flex flex-col transition-all cursor-pointer select-none ${
                                milestone.completed ? "border-emerald-100 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30" : "border-slate-150 border-slate-200 dark:border-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                    milestone.completed ? "bg-[#6342E8] border-[#6342E8] text-slate-900 dark:text-white" : "border-slate-300"
                                  }`}>
                                    {milestone.completed && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className={`font-bold text-xs block ${milestone.completed ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                                      {milestone.title}
                                    </span>
                                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">{milestone.desc}</span>
                                  </div>
                                </div>

                                <span className="text-[9px] font-mono tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                                  {milestone.completed ? "Completed" : "Pending"}
                                </span>
                              </div>

                              {isExpanded && (
                                <div 
                                  className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                                    {milestone.youtubeUrl && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          try { window.open(milestone.youtubeUrl, '_blank'); } catch(err) { console.error(err); }
                                        }}
                                        className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 px-3.5 py-2 rounded-xl text-[10px] font-extrabold border border-red-200/50 dark:border-red-500/20 transition-all cursor-pointer"
                                      >
                                        <Youtube className="w-3.5 h-3.5" />
                                        <span>Watch Video Tutorial</span>
                                      </button>
                                    )}
                                    {milestone.websiteUrl && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          try { window.open(milestone.websiteUrl, '_blank'); } catch(err) { console.error(err); }
                                        }}
                                        className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-3.5 py-2 rounded-xl text-[10px] font-extrabold border border-blue-200 dark:border-blue-500/20 transition-all cursor-pointer"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Study Documentation</span>
                                      </button>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleToggleMilestone(tierIdx, msIdx)}
                                    className={`w-full sm:w-auto px-4.5 py-2 rounded-xl text-[10px] font-extrabold shadow-sm dark:shadow-lg dark:shadow-purple-500/10 transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                                      milestone.completed 
                                        ? "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-300"
                                        : "bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white border-purple-500/20"
                                    }`}
                                  >
                                    {milestone.completed ? (
                                      <span>Mark as Incomplete</span>
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Mark as Completed</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* TAB: AI MENTOR CHAT (Screen 14) */}
            {tab === 'mentor' && (
              <motion.div 
                key="mentor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Mentor Chat</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Accelerate your career goals. Secure professional heuristics feedback directly from real-time model analysis.</p>
                </div>

                <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-3xl h-[520px] flex flex-col shadow-xs overflow-hidden">
                  
                  {/* Messages list */}
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                    {messages.map((m) => (
                      <div 
                        key={m.id} 
                        className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-lg rounded-2xl p-4 shadow-xs text-xs whitespace-pre-wrap leading-relaxed ${
                          m.sender === 'user' 
                            ? 'bg-[#6342E8] text-white rounded-tr-none' 
                            : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium'
                        }`}>
                          <span className="block font-bold text-[9px] font-mono mb-1 text-slate-600 dark:text-slate-400 tracking-widest uppercase">
                            {m.sender === 'user' ? 'YOU' : 'AI CAREER COACH'}
                          </span>
                          <p>{m.text}</p>
                          <span className={`block text-[8px] text-right mt-1.5 font-mono ${m.sender === 'user' ? 'text-purple-200' : 'text-slate-600 dark:text-slate-400'}`}>
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {sendingMsg && (
                      <div className="flex justify-start">
                        <div className="max-w-xs rounded-2xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-tl-none text-xs flex gap-2 items-center">
                          <span className="w-1.5 h-1.5 bg-purple-50 dark:bg-purple-900/300 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-purple-50 dark:bg-purple-900/300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-purple-50 dark:bg-purple-900/300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono italic">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Bubble Suggestions */}
                  <div className="p-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2 justify-center bg-slate-50 dark:bg-white/5/50">
                    {[
                      "Best skills to learn?",
                      "Portfolio tips?",
                      "How to get internship?"
                    ].map((bubble, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMentorMessage(bubble)}
                        className="bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/60 border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-100 px-3.5 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {bubble}
                      </button>
                    ))}
                  </div>

                  {/* Form Submission input */}
                  <div className="p-4 border-t border-slate-250 border-slate-200 dark:border-white/10 flex gap-2.5 items-center">
                    <input
                      type="text"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMentorMessage();
                      }}
                      placeholder="Type your question for CareerSphere AI..."
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white dark:bg-[#14183B] text-slate-800 dark:text-slate-200 font-medium"
                    />
                    <button
                      onClick={() => handleSendMentorMessage()}
                      className="bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white p-3 rounded-xl transition-all shadow-md dark:shadow-xl dark:shadow-purple-500/20 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4 text-slate-900 dark:text-white" />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: MOCK INTERVIEW PORTAL (Screens 15-16) */}
            {tab === 'interview' && (
              <motion.div 
                key="interview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MockInterviewPortal
                  userName={editName}
                  selectedRole={selectedRole}
                  userEmail={userEmail}
                  isOfficialScheduledInterview={!!candidateRecord?.scheduledDate && candidateRecord?.interviewRSVP === 'confirmed'}
                />
              </motion.div>
            )}


            {/* TAB: JOB MATCHING (Screen 17) */}
            {tab === 'jobs' && (
              <motion.div 
                key="jobs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Personalized Job Board</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Discover and immediately apply to active requisitions mapped perfectly to your skill indices.</p>
                </div>

                {/* Filter Menu Tabs */}
                <div className="border-b border-slate-200 dark:border-white/10 flex gap-6 pb-2.5">
                  {(['Recommended', 'Saved', 'Applied'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setJobFilter(filterOpt)}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        jobFilter === filterOpt ? "border-[#6342E8] text-[#6342E8]" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {filterOpt}
                    </button>
                  ))}
                </div>

                {/* Grid Lists Job Cards */}
                <div className="space-y-4">
                  {jobPosts
                    .filter(job => {
                      if (jobFilter === 'Applied') return job.applied;
                      return true; // Simple filter simulation
                    })
                    .map((job) => {
                      const isJobApplied = job.applied || (candidateRecord?.appliedJobId === job.id);
                      const jobStatus = candidateRecord?.appliedJobId === job.id ? candidateRecord?.status : null;
                      const recruiterCompanyName = companyProfile?.name || "Nexis AI Solutions";
                      const isThisCompany = job.company.toLowerCase() === recruiterCompanyName.toLowerCase();

                      return (
                        <div key={job.id} className="p-5 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs hover:border-[#6342E8] transition-all flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center w-full">
                            <div className="flex gap-4 items-start">
                              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-[#6342E8] border border-purple-100 dark:border-purple-800/50 rounded-xl flex items-center justify-center font-bold italic font-mono shrink-0">
                                {job.company.substring(0, 1)}
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{job.title}</h3>
                                  <span className="text-xs text-slate-500 font-semibold">{job.company} • {job.location}</span>
                                </div>
                                
                                {/* Tags list */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {job.skills.map((s, idx) => (
                                    <span key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-150 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono font-medium">
                                      {s}
                                    </span>
                                  ))}
                                  <span className="bg-purple-100 border border-purple-200 dark:border-purple-700/50 text-[#6342E8] font-bold px-2.5 py-0.5 rounded text-[10px] font-mono select-none">
                                    {job.salary}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-end gap-3 text-right">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-450 block font-mono">MATCH RATE:</span>
                                <span className="bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-0.5 font-bold text-xs">
                                  {job.matchScore}%
                                </span>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {isJobApplied ? (
                                  jobStatus === "Approved" || jobStatus === "Shortlisted" ? (
                                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-slate-900 dark:text-white border border-emerald-500 shadow-xs uppercase">Approved &amp; Invited</span>
                                  ) : jobStatus === "Rejected" ? (
                                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-slate-900 dark:text-white border border-rose-500 shadow-xs uppercase">Rejected</span>
                                  ) : jobStatus === "Hired" ? (
                                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/300 text-slate-900 dark:text-white border border-amber-400 shadow-xs uppercase">✓ Hired</span>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 items-end">
                                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:border-emerald-700/50 block text-center w-full">Applied</span>
                                      <button onClick={() => handleCancelApplication(job.id)} className="text-[10px] text-slate-500 hover:text-rose-500 font-bold underline cursor-pointer px-1 py-0.5">Cancel Application</button>
                                    </div>
                                  )
                                ) : (
                                  <button
                                    onClick={() => handleApplyToJob(job.id)}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#6342E8] hover:bg-purple-700 text-slate-900 dark:text-white transition-all active:scale-95 shadow-xs cursor-pointer"
                                  >
                                    Apply Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Full corporate partner information section at bottom of card */}
                          {isThisCompany && companyProfile && (
                            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-600 dark:text-slate-400 font-bold uppercase pb-1.5 border-b border-slate-200 dark:border-white/10/60">
                                <span className="text-[#6342E8] font-extrabold">Corporate Partner Details</span>
                                <span className="text-purple-600 dark:text-purple-400 font-extrabold">{companyProfile.industry}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs leading-relaxed text-slate-705 text-slate-700 dark:text-slate-300 text-left">
                                <div>
                                  <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Headquarters Location</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.address}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Website URI</span>
                                  <a href={companyProfile.website} target="_blank" rel="noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">{companyProfile.website.replace('https://','')}</a>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Employee size bracket</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.size} employees</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-600 dark:text-slate-400 block uppercase font-mono font-bold">Talent Contact info</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{companyProfile.email} ({companyProfile.phone})</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE HUB (Screen 18) */}
            {tab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* User Header card */}
                <div className="bg-white dark:bg-gradient-to-br dark:from-[#0B0E2E] dark:to-[#1D174F] p-6 rounded-3xl text-slate-900 dark:text-white flex flex-col md:flex-row gap-6 items-center border border-slate-200 dark:border-purple-500/10 w-full">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 border-2 border-purple-400 rounded-full flex items-center justify-center overflow-hidden bg-purple-900/40 font-black text-2xl text-purple-300 relative">
                      {candidateRecord?.photo ? (
                        <img src={candidateRecord.photo} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        editName ? editName.charAt(0).toUpperCase() : "Y"
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-5 h-5 text-slate-900 dark:text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {isEditingProfile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono tracking-widest text-purple-300 uppercase font-bold">Full Name</label>
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono tracking-widest text-purple-300 uppercase font-bold">Location</label>
                          <input 
                            type="text" 
                            value={editLocation} 
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono tracking-widest text-purple-300 uppercase font-bold">Phone Number</label>
                          <input 
                            type="text" 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono tracking-widest text-purple-300 uppercase font-bold">Email Address</label>
                          <input 
                            type="email" 
                            value={userEmail || "yogeshwari@email.com"} 
                            disabled
                            className="w-full bg-white dark:bg-[#14183B]/5 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 rounded-xl px-3 py-2 text-xs outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center md:text-left space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{editName}</h3>
                          <span className="w-fit bg-emerald-50 dark:bg-emerald-900/30 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-mono">Active</span>
                        </div>
                        <p className="text-xs text-purple-300 font-semibold">{selectedRole} • {editLocation}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{userEmail || "yogeshwari@email.com"} • {editPhone}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isEditingProfile ? (
                      <>
                        <button 
                          onClick={handleCancelEditing}
                          className="bg-white dark:bg-[#14183B]/10 hover:bg-white dark:bg-[#14183B]/15 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-all font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          className="bg-[#6342E8] hover:bg-purple-750 border border-purple-500/20 px-4 py-2 rounded-xl text-xs text-slate-900 dark:text-white transition-all font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={handleStartEditing}
                        className="bg-white dark:bg-[#14183B]/10 hover:bg-white dark:bg-[#14183B]/20 border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-all font-bold cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Directory components */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  
                  {/* Account directory items (List 6 indicators) */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-mono tracking-widest text-slate-600 dark:text-slate-400 uppercase font-bold">Portfolio & Career Milestones</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { 
                            title: 'Certificates Listed', 
                            tracking: (uploadedFile || candidateRecord?.resumeFileData)
                              ? `${certificatesCount} Approved Credentials` 
                              : '2 Approved Credentials', 
                            color: 'bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10' 
                          },
                          { 
                            title: 'Portfolio Projects', 
                            tracking: (uploadedFile || candidateRecord?.resumeFileData)
                              ? `${projectsCount} Active Case Studies` 
                              : '1 Active Case Studies', 
                            color: 'bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10' 
                          },
                          { 
                            title: 'Primary Skills Stack', 
                            tracking: (uploadedFile || candidateRecord?.resumeFileData)
                              ? `${skillsCount} Total Tools Declared` 
                              : `${skills.length} Total Tools Declared`, 
                            color: 'bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10' 
                          },
                          { 
                            title: 'Profile Achievements', 
                            tracking: (uploadedFile || candidateRecord?.resumeFileData)
                              ? `${achievementsCount} Interactive Badge Medals` 
                              : '3 Interactive Badge Medals', 
                            color: 'bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10' 
                          }
                        ].map((card, i) => (
                          <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${card.color}`}>
                            <div>
                              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{card.title}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block font-mono">{card.tracking}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resume insights (Strengths & Areas of Improvement) */}
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-mono tracking-widest text-slate-800 dark:text-slate-200 uppercase font-bold">Resume Analysis (Insights & Gaps)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl space-y-3 text-left">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider font-mono">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Core Strengths</span>
                          </div>
                          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {resumeStrengths.map((strength, idx) => (
                              <li key={idx}>• {strength}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvement Areas */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-xl space-y-3 text-left">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Areas of Improvement</span>
                          </div>
                          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {resumeWeaknesses.map((weakness, idx) => (
                              <li key={idx}>• {weakness}</li>
                            ))}

                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights section list of credentials */}
                  <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl h-fit space-y-4">
                    <h3 className="text-xs font-mono tracking-widest text-[#6342e8] uppercase font-extrabold">System Credentials</h3>
                    <div className="space-y-3.5">
                      {isEditingProfile ? (
                        <>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono tracking-widest text-[#6342e8] uppercase font-extrabold">Degree / Education</label>
                            <input 
                              type="text" 
                              value={editDegree} 
                              onChange={(e) => setEditDegree(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-850 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white dark:bg-[#14183B]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono tracking-widest text-[#6342e8] uppercase font-extrabold">Languages</label>
                            <input 
                              type="text" 
                              value={editLanguages} 
                              onChange={(e) => setEditLanguages(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-850 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white dark:bg-[#14183B]"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl space-y-1 text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-xs block">{editDegree}</span>
                            <span className="text-[10px] text-slate-450 text-slate-600 dark:text-slate-400 block font-mono">Anna University • Chennai</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl space-y-1 text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-xs block">Languages Fluency</span>
                            <span className="text-[10px] text-slate-450 text-slate-600 dark:text-slate-400 block font-mono">{editLanguages}</span>
                          </div>
                        </>
                      )}
                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl space-y-1 text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-xs block">Availability</span>
                        <span className="text-[10px] text-slate-405 text-slate-600 dark:text-slate-400 block font-mono font-medium">30 Days Corporate Notice Period</span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Slide-out Recruiter Emails Notification Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#0B0E2E]/95 border-l border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-2xl p-6 flex flex-col z-10 text-slate-900 dark:text-white font-sans"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <h3 className="font-extrabold text-sm tracking-tight">Recruiter Communications</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-white dark:bg-[#14183B]/10 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {!candidateRecord?.emails || candidateRecord.emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                    <div className="w-12 h-12 bg-white dark:bg-[#14183B]/5 rounded-full flex items-center justify-center text-slate-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-600 dark:text-slate-400 block">No messages from recruiters yet</span>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1">Apply to jobs in Nexis AI Solutions or Freshworks to receive updates and offline interview details here.</p>
                    </div>
                  </div>
                ) : (
                  candidateRecord.emails.map((email: any) => {
                    const isApproved = email.status === "Approved";
                    return (
                      <div key={email.id} className="p-4 bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3 select-text">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono tracking-widest text-[#38bdf8] uppercase block font-bold">{email.sender}</span>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1 leading-snug">{email.subject}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                            isApproved ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-300" : "bg-rose-50 dark:bg-rose-900/30 text-rose-300"
                          }`}>
                            {email.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium text-justify">
                          {email.body}
                        </p>
                        {isApproved && (
                          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-[9px] text-emerald-300 leading-tight font-medium">Nexis AI Solutions Office, Tidel Park, Tharamani, Chennai</span>
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 font-mono block text-right pt-1">{email.date}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div></div>
  );
}
