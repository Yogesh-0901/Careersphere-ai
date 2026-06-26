import { useState, useEffect } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { Menu, Sun, Moon,  
  Building2, Users, Calendar, BarChart3, Mail, Settings, Briefcase, Bell, Search, 
  ArrowLeft, Check, X, Shield, Plus, Upload, Filter, CircleEqual, GraduationCap,
  Sparkles, Globe, Phone, MapPin, CheckCircle, TrendingUp, HelpCircle, ChevronRight, Download
 } from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc, deleteDoc, onSnapshot, collection, getDocs } from "firebase/firestore";

interface RecruiterWorkspaceProps {
  userName: string;
  userRole: 'student' | 'recruiter' | null;
  onLogout: () => void;
  onNavigateToCandidate: () => void;
}

export default function RecruiterWorkspace({ userName, userRole, onLogout, onNavigateToCandidate }: RecruiterWorkspaceProps) {
  // Tabs: 'dashboard' | 'analytics' | 'candidate-profile' | 'applications' | 'interviews' | 'reports' | 'settings'
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tab, setTab] = useState<'dashboard' | 'jobs' | 'analytics' | 'candidate-profile' | 'applications' | 'interviews' | 'reports' | 'settings'>('dashboard');

  // Modal / Selection state
  const [selectedCandidate, setSelectedCandidate] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("cs_registered_candidates");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed[0].name;
      }
    } catch (e) {}
    return "Yogeshwari";
  });
  
  // 24. Company profile settings state
  const [companyName, setCompanyName] = useState("Nexis AI Solutions");
  const [industry, setIndustry] = useState("Software Development");
  const [companySize, setCompanySize] = useState("1001-5000");
  const [website, setWebsite] = useState("https://www.nexisai.io");
  const [companyPhone, setCompanyPhone] = useState("+91 44 4567 8900");
  const [companyEmail, setCompanyEmail] = useState("recruiter@nexisai.io");
  const [companyAddress, setCompanyAddress] = useState("Tidel Park, Tharamani, Chennai, Tamil Nadu, India");
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Jobs State
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    role: 'UI/UX Designer',
    location: 'Remote',
    salary: '₹5 - 8 LPA',
    skills: '',
  });

  useEffect(() => {
    if (userRole !== 'recruiter') return;
    const q = collection(db, 'jobs');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter by this recruiter's email
      const myJobs = jobs.filter((j: any) => j.recruiterEmail === companyEmail);
      setPostedJobs(myJobs);
    });
    return () => unsubscribe();
  }, [userRole, companyEmail]);

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = jobForm.skills.split(',').map(s => s.trim()).filter(s => s);
    const jobData = {
      title: jobForm.title,
      role: jobForm.role,
      location: jobForm.location,
      salary: jobForm.salary,
      skills: skillsArray,
      company: companyName,
      recruiterEmail: companyEmail,
      postedDate: new Date().toISOString(),
      isActive: true
    };

    try {
      if (editingJobId) {
        await updateDoc(doc(db, 'jobs', editingJobId), jobData);
      } else {
        await setDoc(doc(db, 'jobs', Date.now().toString()), jobData);
      }
      setShowJobModal(false);
      setEditingJobId(null);
      setJobForm({ title: '', role: 'UI/UX Designer', location: 'Remote', salary: '₹5 - 8 LPA', skills: '' });
    } catch (err) {
      console.error("Error saving job", err);
      alert("Failed to save job");
    }
  };

    const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this job posting?")) {
      try {
        await deleteDoc(doc(db, 'jobs', id));
      } catch (err) {
        console.error("Error deleting job", err);
      }
    }
  };

  const handleToggleJobVisibility = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "hide this job from students" : "republish this job for students";
    if (confirm(`Are you sure you want to ${action}?`)) {
      try {
        await updateDoc(doc(db, 'jobs', id), { isActive: !currentStatus });
      } catch (err) {
        console.error("Error toggling job visibility", err);
      }
    }
  };


  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Bell notification panel state
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Interview schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<{
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    date: string;
    time: string;
    venue: string;
    interviewer: string;
    category: string;
    durationHours: string;
  }>({
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    date: '',
    time: '10:00',
    venue: 'Nexis AI Solutions, Tidel Park, Block A, 4th Floor, Tharamani, Chennai — 600113',
    interviewer: 'Jenny Wilson',
    category: 'Technical Interview',
    durationHours: '1 Hour'
  });
  const [schedulingInProgress, setSchedulingInProgress] = useState(false);

  // Email Config Modal State Variables
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalCandidate, setEmailModalCandidate] = useState<any>(null);
  const [emailModalSubject, setEmailModalSubject] = useState("");
  const [emailModalBody, setEmailModalBody] = useState("");
  const [emailModalActionType, setEmailModalActionType] = useState<'Approve' | 'Reject' | 'Custom' | 'Hire'>('Approve');

  // Quick Action triggers for shortlisted tags
  const [candidatesList, setCandidatesList] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    exp: string;
    match: number;
    date: string;
    status: 'New' | 'In Review' | 'Applied' | 'Shortlisted' | 'Rejected' | 'Hired' | string;
    resumeScore: number | null;
    resumeFileName?: string;
    appliedJobTitle?: string;
    appliedJobCompany?: string;
    newApplicationNotification?: boolean;
    interviewsTaken?: any[];
    emails?: any[];
    hiredAt?: string;
  }[]>(() => {
    try {
      const stored = localStorage.getItem("cs_registered_candidates");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load candidates from local storage:", e);
    }
    return [
      { id: "yogeshwari", name: "Yogeshwari", email: "yogeshwari@email.com", role: "UI/UX Designer", exp: "2-4 yrs", match: 96, date: "May 18, 2024", status: "Shortlisted", resumeScore: 96, interviewsTaken: [] },
      { id: "priya", name: "Priya Sharma", email: "priya@email.com", role: "Data Analyst", exp: "3-5 yrs", match: 92, date: "May 11, 2024", status: "In Review", resumeScore: 92, interviewsTaken: [] },
      { id: "arun", name: "Arun Kumar", email: "arun@email.com", role: "Frontend Developer", exp: "2-3 yrs", match: 88, date: "May 04, 2024", status: "In Review", resumeScore: 88, interviewsTaken: [] },
      { id: "rahul", name: "Rahul Verma", email: "rahul@email.com", role: "Product Designer", exp: "4-6 yrs", match: 85, date: "Apr 27, 2024", status: "Shortlisted", resumeScore: 85, interviewsTaken: [] },
      { id: "sneha", name: "Sneha Reddy", email: "sneha@email.com", role: "Marketing Specialist", exp: "2-4 yrs", match: 78, date: "Apr 20, 2024", status: "New", resumeScore: 78, interviewsTaken: [] }
    ];
  });

  const [roleFilter, setRoleFilter] = useState<string>("All Roles");
  const [expFilter, setExpFilter] = useState<string>("All Experience Brackets");
  const [activeFunnelStage, setActiveFunnelStage] = useState<'All' | 'Applied' | 'Screened' | 'Interview' | 'Selected' | 'Rejected'>('All');

  // Keep candidatesList synced with localStorage
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("cs_registered_candidates");
        if (stored) {
          setCandidatesList(JSON.parse(stored));
        }
      } catch (e) {}
    };

    handleSync();
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [tab]);

  const getFilteredCandidates = () => {
    return candidatesList.filter(cand => {
      const matchRole = roleFilter === "All Roles" || 
        cand.role.toLowerCase() === roleFilter.toLowerCase() ||
        cand.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
        (roleFilter === "UI/UX Designer" && (cand.role.toLowerCase().includes("design") || cand.role.toLowerCase().includes("ux") || cand.role.toLowerCase().includes("ui"))) ||
        (roleFilter === "Frontend Engineer" && (cand.role.toLowerCase().includes("frontend") || cand.role.toLowerCase().includes("developer") || cand.role.toLowerCase().includes("engineer") || cand.role.toLowerCase().includes("javascript"))) ||
        (roleFilter === "Full Stack Developer" && (cand.role.toLowerCase().includes("full") || cand.role.toLowerCase().includes("stack") || cand.role.toLowerCase().includes("mern"))) ||
        (roleFilter === "AI & ML Engineer" && (cand.role.toLowerCase().includes("ai") || cand.role.toLowerCase().includes("ml") || cand.role.toLowerCase().includes("machine") || cand.role.toLowerCase().includes("intelligence")));
      
      const yearsMatch = cand.exp.match(/\d+/g);
      let minYears = 0;
      if (yearsMatch) {
        minYears = parseInt(yearsMatch[0], 10);
      }
      
      const matchExp = expFilter === "All Experience Brackets" ||
        (expFilter === "1-3 Years" && (minYears >= 1 && minYears <= 3)) ||
        (expFilter === "3-5 Years" && (minYears >= 3 && minYears <= 5));
      
      return matchRole && matchExp;
    });
  };

  const handleDownloadReport = () => {
    if (candidatesList.length === 0) {
      alert("No candidate records available to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Role", "Experience", "ATS Match Score (%)", "Registration Date", "Status"];
    const rows = candidatesList.map(c => [
      c.id,
      c.name,
      c.email,
      c.role,
      c.exp,
      (c.match || 0).toString(),
      c.date,
      c.status
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `careersphere_recruitment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadResume = (cand: any) => {
    const resumeName = cand.resumeFileName || `${cand.name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`;
    
    if (cand.resumeFileData) {
      // Direct binary download from base64 Data URL
      const link = document.createElement("a");
      link.setAttribute("href", cand.resumeFileData);
      link.setAttribute("download", resumeName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const content = `CAREERSPHERE AI - RESUME REPORT\n` +
      `====================================\n\n` +
      `Candidate Name: ${cand.name}\n` +
      `Email: ${cand.email || (cand.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@email.com')}\n` +
      `Target Role: ${cand.role}\n` +
      `Experience: ${cand.exp}\n` +
      `Automated ATS Match Score: ${cand.match || 0}%\n` +
      `Status: ${cand.status}\n\n` +
      `Skills & Competencies:\n` +
      `- Figma & UI/UX layout design\n` +
      `- Python programming\n` +
      `- SQL Querying and data models\n` +
      `- JavaScript, HTML & CSS layout frameworks\n\n` +
      `Generated automatically by CareerSphere AI Hiring Portal.`;
      
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", resumeName.endsWith('.pdf') ? resumeName.replace('.pdf', '_details.txt') : resumeName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEmailModal = (cand: any, actionType: 'Approve' | 'Reject' | 'Custom' | 'Hire') => {
    setEmailModalCandidate(cand);
    setEmailModalActionType(actionType);
    
    if (actionType === 'Approve') {
      setEmailModalSubject("Invitation for Offline Interview — CareerSphere AI | Nexis AI Solutions");
      setEmailModalBody(
        `Dear ${cand.name},\n\n` +
        `Good Morning! We are pleased to formally notify you that your application for the ${cand.role || 'position'} role at Nexis AI Solutions has been reviewed and approved for the next stage.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 OFFLINE INTERVIEW INVITATION DETAILS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Interview Date  : [DATE_PLACEHOLDER]\n` +
        `Reporting Time  : [TIME_PLACEHOLDER] (Please arrive 15 minutes early)\n` +
        `Venue Location  : Nexis AI Solutions, Tidel Park, Block A, 4th Floor, Tharamani, Chennai — 600113\n` +
        `Interview Mode  : Offline — Technical Panel Round + HR Round\n` +
        `Interview Lead  : [LEAD_INTERVIEWER_PLACEHOLDER]\n\n` +
        `Please carry the following documents:\n` +
        `  • Government-issued Photo ID (Aadhaar / Passport)\n` +
        `  • 3 printed copies of your updated resume\n` +
        `  • Academic certificates and experience letters\n\n` +
        `Kindly confirm your attendance by replying to this email within 24 hours.\n\n` +
        `We look forward to meeting you and wish you the very best.\n\n` +
        `Warm regards,\n` +
        `Nexis AI Solutions — Talent Acquisition Team\n` +
        `careers@nexisai.io | +91 44 4567 8900\n` +
        `www.nexisai.io`
      );
    } else if (actionType === 'Hire') {
      setEmailModalSubject(`CareerSphere AI: Official Selection & Job Offer — ${cand.role || 'Position'} at Nexis AI Solutions`);
      setEmailModalBody(
        `Dear ${cand.name},\n\n` +
        `Good Morning! On behalf of the entire Nexis AI Solutions leadership team, we are absolutely thrilled to formally extend this Official Offer of Employment to you. Congratulations — you have been SELECTED!\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎉 OFFICIAL JOB OFFER — ONBOARDING DETAILS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Offer Token ID   : [OFFER_TOKEN_PLACEHOLDER]\n` +
        `Candidate Name   : ${cand.name}\n` +
        `Offered Role     : ${cand.role || '[ROLE_PLACEHOLDER]'}\n` +
        `Department       : [DEPARTMENT_PLACEHOLDER]\n` +
        `Reporting Manager: [MANAGER_PLACEHOLDER]\n` +
        `Join Date        : [JOIN_DATE_PLACEHOLDER]\n` +
        `Work Location    : Nexis AI Solutions, Tidel Park, Chennai — 600113\n` +
        `CTC Package      : [CTC_PACKAGE_PLACEHOLDER] per annum\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 PRE-ONBOARDING ACTION ITEMS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Please complete the following before your joining date:\n` +
        `  1. Sign and return the attached Offer Letter PDF\n` +
        `  2. Submit all educational qualification certificates\n` +
        `  3. Provide previous employer experience letters and relieving letters\n` +
        `  4. Complete the background verification form (link below)\n` +
        `  5. Report to the HR department on the joining date with originals\n\n` +
        `Background Verification Link: [BG_VERIFY_LINK_PLACEHOLDER]\n\n` +
        `We are delighted to welcome you to the Nexis AI Solutions family. Your journey in building ` +
        `next-generation AI-powered enterprise solutions begins here.\n\n` +
        `Once again, congratulations ${cand.name} — you earned this!\n\n` +
        `With warmest regards,\n` +
        `Nexis AI Solutions — Human Resources & Talent Team\n` +
        `careers@nexisai.io | +91 44 4567 8900\n` +
        `www.nexisai.io`
      );
    } else if (actionType === 'Reject') {
      setEmailModalSubject("Application Update - CareerSphere AI");
      setEmailModalBody(`Dear ${cand.name},\n\nThank you for your interest in the position. Unfortunately, we are not moving forward with your application at this time. We wish you all the best in your future endeavors.\n\nBest regards,\nNexis AI Solutions Recruitment Team`);
    } else {
      setEmailModalSubject("Interview Invitation: Update - CareerSphere AI");
      setEmailModalBody(`Dear ${cand.name},\n\nWe would like to invite you to attend an offline interview at our campus. Please let us know your availability.\n\nBest regards,\nNexis AI Solutions Recruitment Team`);
    }
    setShowEmailModal(true);
  };

  // CANDIDATE_HIRED event handler — fires final onboarding approval
  const handleHireCandidate = (candName: string) => {
    const cand = candidatesList.find(c => c.name === candName);
    if (!cand) return;

    const hiringPayload = {
      event_type: "CANDIDATE_HIRED",
      timestamp: new Date().toISOString(),
      pipeline_tracking: {
        candidate_name: cand.name,
        target_role: cand.role,
        hiring_company: companyName,
        previous_stage: "Administered Interview rounds",
        current_stage: "Selected / Hired"
      },
      dashboard_funnel_deltas: {
        total_applications_card: candidatesList.length,
        selected_hired_card_increment: 1,
        rejected_applicants_card: candidatesList.filter(c => c.status === "Rejected").length,
        screening_in_pipeline_card: candidatesList.filter(c => c.status === "In Review" || c.status === "New").length,
        funnel_stages_split: {
          applied_count: candidatesList.length,
          screened_passes_count: candidatesList.filter(c => c.resumeScore !== null).length,
          interview_rounds_count: candidatesList.filter(c => c.status === "Shortlisted" || c.status === "Hired").length,
          hired_conversion_percentage: parseFloat(((1 / (candidatesList.length || 1)) * 100).toFixed(2))
        }
      },
      communications_payload: {
        trigger_email_dispatch: true,
        recipient_email: companyEmail,
        target_student_email: cand.email,
        email_metadata: {
          subject: `CareerSphere AI: Official Selection & Job Offer — ${cand.role} at ${companyName}`,
          body_template: `Dear ${cand.name}, We are thrilled to formally extend an offer of employment for the ${cand.role} position at ${companyName} following your successful offline interview panels. Welcome aboard!`
        }
      },
      portal_header_context: "Good Morning, Recruiter!"
    };
    console.log("[CANDIDATE_HIRED EVENT PAYLOAD]", JSON.stringify(hiringPayload, null, 2));

    // Update candidate status to Hired and persist
    setCandidatesList(prev => {
      const updated = prev.map(c =>
        c.name === candName
          ? { ...c, status: 'Hired', hiredAt: new Date().toISOString(), newApplicationNotification: false }
          : c
      );
      
      return updated;
    });

    // Open the Hire email modal with offer letter
    openEmailModal(cand, 'Hire');
  };

  const sendEmailThroughAPI = async (to: string, subject: string, body: string): Promise<any> => {
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
        return true;
      } else {
        const err = await response.text();
        console.error("EmailJS error:", err);
        return err;
      }
    } catch (err: any) {
      console.warn("[Email API] unreachable:", err?.message || err);
      return err?.message || "Network Error";
    }
  };

  const [emailSentToast, setEmailSentToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const handleSendEmailFromModal = async (statusType: 'Shortlisted' | 'Rejected' | 'Rejected - Invited' | 'Hired') => {
    if (!emailModalCandidate) return;

    const isHired = statusType === 'Hired';
    const emailMsg = {
      id: Date.now().toString(),
      subject: emailModalSubject,
      body: emailModalBody,
      date: new Date().toLocaleString("en-IN"),
      sender: "Nexis AI Solutions Recruitment Team",
      status: isHired ? 'Hired' : statusType === 'Shortlisted' ? 'Approved' : 'Rejected'
    };

    const candCopy = { ...emailModalCandidate };
    const subjectCopy = emailModalSubject;
    const bodyCopy = emailModalBody;

    // 1. Close modal and update dashboard FIRST — no blocking
    setShowEmailModal(false);
    setEmailModalCandidate(null);

    setCandidatesList(prev => {
      const updated = prev.map(c =>
        c.name === candCopy.name
          ? {
              ...c,
              status: isHired
                ? 'Hired'
                : statusType === 'Shortlisted'
                  ? 'Shortlisted'
                  : statusType === 'Rejected - Invited'
                    ? 'Shortlisted'
                    : 'Rejected',
              newApplicationNotification: false,
                officialInterviewResult: c.officialInterviewResult ? { 
                  ...c.officialInterviewResult, 
                  approvedOrRejected: isHired ? 'Approved' : (statusType === 'Shortlisted' || statusType === 'Rejected - Invited') ? 'Approved' : 'Rejected' 
                } : undefined,
              hiredAt: isHired ? new Date().toISOString() : (c as any).hiredAt,
              emails: [emailMsg, ...(c.emails || [])]
              }
            : c
        );
        
        try {
          localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {}
        
        return updated;
      });

    // 2. Try to send real email via API — failure is silent, dashboard already updated
    const realEmailSent = await sendEmailThroughAPI(candCopy.email, subjectCopy, bodyCopy);

    // 3. Show a non-blocking toast notification
    if (realEmailSent === true) {
      setEmailSentToast({
        msg: isHired
          ? `🎉 Offer letter delivered to ${candCopy.email}! ${candCopy.name} is now officially Hired.`
          : `Real email delivered to ${candCopy.email}!`,
        type: 'success'
      });
    } else {
      setEmailSentToast({
        msg: `EmailJS Failed: ${realEmailSent}. Please check Template ID, variables, or Domain whitelist in EmailJS dashboard.`,
        type: 'info'
      });
    }
    setTimeout(() => setEmailSentToast(null), 6000);
  };

  const handleApproveApplication = (candName: string) => {
    const cand = candidatesList.find(c => c.name === candName);
    if (cand) {
      openEmailModal(cand, 'Approve');
    }
  };

  const handleRejectApplication = (candName: string) => {
    const cand = candidatesList.find(c => c.name === candName);
    if (cand) {
      openEmailModal(cand, 'Reject');
    }
  };

  const handleUpdateStatus = (candidateName: string, newStatus: string) => {
    setCandidatesList(prev => {
      const updated = prev.map(c => c.name === candidateName ? { ...c, status: newStatus } : c);
      try {
        localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist updated status:", e);
      }
    });
  };

  const handleApproveOfficialInterview = (candidateName: string) => {
    setCandidatesList(prev => {
      const updated = prev.map(c => {
        if (c.name === candidateName) {
          const result = c.officialInterviewResult ? { ...c.officialInterviewResult, approvedOrRejected: 'Approved' } : undefined;
          return {
            ...c,
            status: 'Shortlisted',
            officialInterviewResult: result
          } as any;
        }
        return c;
      });
      
      try { localStorage.setItem("cs_registered_candidates", JSON.stringify(updated)); window.dispatchEvent(new Event("storage")); } catch(e){} return updated;
    });
    const cand = candidatesList.find(c => c.name === candidateName);
    if (cand) {
      openEmailModal({ ...cand, status: 'Shortlisted' }, 'Approve');
    }
  };

  const handleRejectOfficialInterview = (candidateName: string) => {
    setCandidatesList(prev => {
      const updated = prev.map(c => {
        if (c.name === candidateName) {
          const result = c.officialInterviewResult ? { ...c.officialInterviewResult, approvedOrRejected: 'Rejected' } : undefined;
          return {
            ...c,
            status: 'Rejected',
            officialInterviewResult: result
          } as any;
        }
        return c;
      });
      
      try { localStorage.setItem("cs_registered_candidates", JSON.stringify(updated)); window.dispatchEvent(new Event("storage")); } catch(e){} return updated;
    });
    const cand = candidatesList.find(c => c.name === candidateName);
    if (cand) {
      openEmailModal({ ...cand, status: 'Rejected' }, 'Reject');
    }
  };


  // Recharts Data: Candidate overview volume calculated dynamically from candidates list
  const getGrowthData = () => {
    let latestDate = new Date();
    if (candidatesList.length > 0) {
      const dates = candidatesList
        .map(c => new Date(c.date))
        .filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
      }
    }

    const weeks: { date: Date; week: string; Candidates: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const wDate = new Date(latestDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weeks.push({
        date: wDate,
        week: wDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Candidates: 0
      });
    }

    candidatesList.forEach(cand => {
      const candDate = new Date(cand.date);
      if (isNaN(candDate.getTime())) return;

      let bestIndex = 4;
      let minDiff = Infinity;
      weeks.forEach((w, idx) => {
        const diff = Math.abs(candDate.getTime() - w.date.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          bestIndex = idx;
        }
      });
      weeks[bestIndex].Candidates += 1;
    });

    return weeks;
  };

  const dynamicGrowthData = getGrowthData();
  const peakWeek = dynamicGrowthData.reduce((max, w) => w.Candidates > max.Candidates ? w : max, dynamicGrowthData[0]);
  const peakLabel = peakWeek && peakWeek.Candidates > 0 ? `${peakWeek.week} Peak (${peakWeek.Candidates})` : "Steady Growth";

  // Dynamically calculate skill distribution from candidates list
  const getSkillDistribution = (list = candidatesList) => {
    const counts: Record<string, number> = {
      "Figma": 0,
      "UX Research": 0,
      "JavaScript": 0,
      "Python": 0,
      "SQL": 0
    };

    list.forEach(cand => {
      const r = cand.role.toLowerCase();
      if (r.includes("design") || r.includes("ux") || r.includes("ui")) {
        counts["Figma"] += 1;
        counts["UX Research"] += 1;
      }
      if (r.includes("developer") || r.includes("engineer") || r.includes("frontend") || r.includes("javascript")) {
        counts["JavaScript"] += 1;
      }
      if (r.includes("data") || r.includes("analyst") || r.includes("python")) {
        counts["Python"] += 1;
        counts["SQL"] += 1;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    // Fallback default distribution if candidate list is empty or has zero skills
    if (total === 0) {
      return [
        { name: "Figma", value: 3, percentage: "30%", color: "#6342E8" },
        { name: "UX Research", value: 2, percentage: "20%", color: "#ec4899" },
        { name: "JavaScript", value: 2, percentage: "20%", color: "#eab308" },
        { name: "Python", value: 2, percentage: "20%", color: "#3b82f6" },
        { name: "SQL", value: 1, percentage: "10%", color: "#10b981" }
      ];
    }

    return [
      { name: "Figma", value: counts["Figma"], percentage: `${Math.round((counts["Figma"] / total) * 100)}%`, color: "#6342E8" },
      { name: "UX Research", value: counts["UX Research"], percentage: `${Math.round((counts["UX Research"] / total) * 100)}%`, color: "#ec4899" },
      { name: "JavaScript", value: counts["JavaScript"], percentage: `${Math.round((counts["JavaScript"] / total) * 100)}%`, color: "#eab308" },
      { name: "Python", value: counts["Python"], percentage: `${Math.round((counts["Python"] / total) * 100)}%`, color: "#3b82f6" },
      { name: "SQL", value: counts["SQL"], percentage: `${Math.round((counts["SQL"] / total) * 100)}%`, color: "#10b981" }
    ].filter(item => item.value > 0);
  };

  // Dynamically calculate experience brackets from candidates list
  const getExperienceSpread = (list = candidatesList) => {
    const brackets = {
      "0-1 yrs": 0,
      "1-3 yrs": 0,
      "3-5 yrs": 0,
      "5-8 yrs": 0,
      "8+ yrs": 0
    };

    list.forEach(cand => {
      const exp = cand.exp.toLowerCase();
      if (exp.includes("fresher") || exp.includes("0-1") || exp.includes("1 yr")) {
        brackets["0-1 yrs"] += 1;
      } else if (exp.includes("1-2") || exp.includes("2-3") || exp.includes("1-3") || exp.includes("2 yrs")) {
        brackets["1-3 yrs"] += 1;
      } else if (exp.includes("3-4") || exp.includes("4-5") || exp.includes("3-5") || exp.includes("2-4") || exp.includes("4-6") || exp.includes("3 yrs") || exp.includes("4 yrs")) {
        brackets["3-5 yrs"] += 1;
      } else if (exp.includes("5-6") || exp.includes("6-7") || exp.includes("7-8") || exp.includes("5-8") || exp.includes("5 yrs")) {
        brackets["5-8 yrs"] += 1;
      } else {
        brackets["8+ yrs"] += 1;
      }
    });

    const total = Object.values(brackets).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return [
        { name: "0-1 yrs", Candidates: 1 },
        { name: "1-3 yrs", Candidates: 2 },
        { name: "3-5 yrs", Candidates: 3 },
        { name: "5-8 yrs", Candidates: 1 },
        { name: "8+ yrs", Candidates: 0 }
      ];
    }

    return [
      { name: "0-1 yrs", Candidates: brackets["0-1 yrs"] },
      { name: "1-3 yrs", Candidates: brackets["1-3 yrs"] },
      { name: "3-5 yrs", Candidates: brackets["3-5 yrs"] },
      { name: "5-8 yrs", Candidates: brackets["5-8 yrs"] },
      { name: "8+ yrs", Candidates: brackets["8+ yrs"] }
    ];
  };

  // Dynamically calculate key recruitment hiring trends/insights
  const getHiringInsights = () => {
    const total = candidatesList.length;
    if (total === 0) {
      return [
        "High density of UI/UX design candidates with strong competencies in user research and Figma prototyping.",
        "Prominent technical representation in JavaScript and Python, reflecting solid frontend and programming foundations.",
        "Candidate experience distribution is concentrated in the mid-career bracket (1-3 and 3-5 years)."
      ];
    }

    const skillData = getSkillDistribution();
    const topSkill = skillData.reduce((max, s) => s.value > max.value ? s : max, skillData[0]);

    const expData = getExperienceSpread();
    const topExp = expData.reduce((max, e) => e.Candidates > max.Candidates ? e : max, expData[0]);

    const insights = [
      `Database pool actively tracking ${total} candidate profiles processed under evaluation tracks.`,
    ];

    if (topSkill && topSkill.value > 0) {
      insights.push(`Top skill represented is ${topSkill.name}, accounting for ${topSkill.percentage} of active competencies.`);
    } else {
      insights.push("Stable balance of cross-discipline technical skills across parsed portfolios.");
    }

    if (topExp && topExp.Candidates > 0) {
      insights.push(`Largest candidate experience cohort is the ${topExp.name} bracket.`);
    }

    insights.push("High alignment in structured resume matches with active enterprise hiring standards.");
    return insights;
  };

  // Get active date range window representation
  const getActiveWindow = () => {
    if (candidatesList.length === 0) return "Apr 20 - May 18, 2024";
    const dates = candidatesList
      .map(c => new Date(c.date))
      .filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return "Apr 20 - May 18, 2024";
    const minD = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxD = new Date(Math.max(...dates.map(d => d.getTime())));
    const opt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${minD.toLocaleDateString("en-US", opt)} - ${maxD.toLocaleDateString("en-US", opt)}, ${maxD.getFullYear()}`;
  };

  // Helper to dynamically evaluate candidate for Spotlight
  const getCandidateEvaluation = (cand: { name: string; role: string; exp: string; match: number }) => {
    const role = cand.role;
    const isYogeshwari = cand.name.toLowerCase() === "yogeshwari";
    const scoreVal = cand.match || 75;

    // Default values if candidate is Yogeshwari and target role is AI & ML Engineer
    if (isYogeshwari && (role.toLowerCase().includes("ai") || role.toLowerCase().includes("ml") || role.toLowerCase().includes("machine"))) {
      return {
        about: "Yogeshwari is an entry-level AI & ML Engineer showcasing a robust foundational knowledge in statistical modeling, Python programming, and exploratory data analysis. Her academic portfolio demonstrates a practical familiarity with machine learning algorithms, model evaluation techniques, and data preprocessing workflows. She is prepared for deployment in junior-level model training and analytics pipeline development.",
        competencies: [
          { name: "Python & Data Science Stack", score: 82 },
          { name: "Machine Learning Algorithms", score: 75 },
          { name: "Data Preprocessing & Pipelines", score: 80 }
        ],
        feedback: "Solid entry-level profile showing clear foundations in core Python packages. Incorporating hands-on neural network projects or cloud deployment certifications will significantly enhance overall ATS score and role alignment."
      };
    }

    // Dynamic generations for other combinations
    const isDesign = role.toLowerCase().includes("design") || role.toLowerCase().includes("ux") || role.toLowerCase().includes("ui");
    const isDev = role.toLowerCase().includes("developer") || role.toLowerCase().includes("engineer") || role.toLowerCase().includes("frontend");
    const isData = role.toLowerCase().includes("data") || role.toLowerCase().includes("analyst");

    if (isDesign) {
      return {
        about: `${cand.name} is a design specialist focused on creative interfaces and user advocacy. Demonstrates solid proficiency in wireframing, high-fidelity Figma prototyping, and user journey optimization. Ready to contribute immediately to design-to-development synchronization workflows.`,
        competencies: [
          { name: "Figma Prototyping & Layouts", score: scoreVal },
          { name: "UX Research & Testing", score: Math.round(scoreVal * 0.9) },
          { name: "Interface Design Systems", score: Math.round(scoreVal * 0.95) }
        ],
        feedback: scoreVal >= 80 
          ? "Excellent visual alignment and clean layout guidelines. Portfolio demonstrates outstanding usability practices."
          : "Good design layouts. Enhancing consistency in typography scales and accessibility checks will improve score."
      };
    }

    if (isDev) {
      return {
        about: `${cand.name} is a software engineer with focus on responsive web applications. Showcases clean architecture paradigms, component-driven development, and state management. Ready for deployment into frontend agile software development teams.`,
        competencies: [
          { name: "JavaScript & React framework", score: scoreVal },
          { name: "Component-driven styling", score: Math.round(scoreVal * 0.95) },
          { name: "API integration & State", score: Math.round(scoreVal * 0.9) }
        ],
        feedback: scoreVal >= 80 
          ? "Excellent modular structure and clean components coding style. Technical integration is highly robust."
          : "Solid code structure. Adding unit tests and optimization checks will improve ATS parsing match score."
      };
    }

    if (isData) {
      return {
        about: `${cand.name} is an analytical specialist tracking metrics and data integrity. Showcases robust programming models in query languages, statistics, and visualization suites. Ready for deployment in quantitative decision support workflows.`,
        competencies: [
          { name: "SQL Query Optimization", score: scoreVal },
          { name: "Python Data Analysis Stack", score: Math.round(scoreVal * 0.95) },
          { name: "Data Visualization & BI Tools", score: Math.round(scoreVal * 0.9) }
        ],
        feedback: scoreVal >= 80 
          ? "Highly structured analytics models. Experience with database optimization and clean reporting dashboards is clear."
          : "Good analytics foundations. Adding documentation on large scale dataset parsing will improve ATS matching."
      };
    }

    // General fallback
    return {
      about: `${cand.name} is a dedicated professional targeting a ${role} position. Ready to deploy technical competencies and aligned workflow solutions to meet business delivery objectives.`,
      competencies: [
        { name: "Technical Core Alignment", score: scoreVal },
        { name: "Role-specific Execution", score: Math.round(scoreVal * 0.95) },
        { name: "Professional Standards", score: Math.round(scoreVal * 0.9) }
      ],
      feedback: scoreVal >= 80
        ? "Excellent candidate match across multiple evaluation layers. Profile is highly recommended."
        : "Satisfactory candidate match. Enhancing project references and technical certifications will improve score."
    };
  };

  // Helper to dynamically calculate interview metrics
  const getInterviewMetrics = () => {
    let upcoming = 0;
    let pending = 0;
    let cancelled = 0;
    let completed = 0;

    candidatesList.forEach(cand => {
      if (cand.status === "Shortlisted") {
        upcoming += 1;
        if (cand.resumeScore && cand.resumeScore >= 90) {
          completed += 1;
        }
      } else if (cand.status === "Rejected") {
        cancelled += 1;
      } else {
        pending += 1;
      }
    });

    const baseCompleted = 12 + completed;
    const baseUpcoming = 4 + upcoming;
    const baseCancelled = 1 + cancelled;
    const totalCompletedAndFailed = baseCompleted + baseCancelled;
    const passRate = totalCompletedAndFailed > 0 ? Math.round((baseCompleted / totalCompletedAndFailed) * 100) : 0;

    return {
      upcoming: baseUpcoming,
      completed: baseCompleted,
      cancelled: baseCancelled,
      pending: pending,
      passRate: `${passRate}%`
    };
  };

  // Helper to format dynamic interviews list
  const getInterviewsList = () => {
    return candidatesList.map((cand, idx) => {
      const category = cand.role.includes("Design") || cand.role.includes("UX")
        ? "UI/UX Interview"
        : cand.role.includes("Developer") || cand.role.includes("Engineer")
          ? "Technical Interview"
          : "HR Interview";

      let date = cand.date ? `${cand.date} at 10:00 AM` : `May 24, 2024 at 10:00 AM`;
      if (cand.scheduledDate) {
        date = `${cand.scheduledDate} at ${cand.scheduledTime || '10:00 AM'}`;
      }
      const lead = cand.scheduledInterviewer || (cand.id.length % 2 === 0 ? "Jane Cooper" : "Jenny Wilson");

      // CANDIDATE_HIRED = Completed; Shortlisted = Upcoming; Rejected = Cancelled
      const isHired = cand.status === "Hired";
      const isShortlisted = cand.status === "Shortlisted";
      
      let state: 'Upcoming' | 'Pending Evaluation' | 'Completed' | 'Cancelled' | 'Hired ✓' = 'Pending Evaluation';
      if (isHired) {
        state = 'Hired ✓';
      } else if (cand.status === "Rejected") {
        state = 'Cancelled';
      } else if (cand.interviewRSVP === 'completed') {
        if (cand.officialInterviewResult?.approvedOrRejected === 'Approved') {
          state = 'Completed';
        } else if (cand.officialInterviewResult?.approvedOrRejected === 'Rejected') {
          state = 'Cancelled';
        } else {
          state = 'Pending Evaluation';
        }
      } else if (cand.scheduledDate) {
        state = 'Upcoming';
      } else if (isShortlisted) {
        state = 'Upcoming';
      }

      return {
        candidate_name: cand.name,
        round_category: category,
        date_time: date,
        lead_interviewer: lead,
        schedule_state: state,
        is_hired: isHired
      };
    });
  };

  // Helper to dynamically calculate funnel reports data
  const getFunnelData = () => {
    const total = candidatesList.length;
    const screened = candidatesList.filter(c => c.resumeScore !== null).length;
    // Interview stage: Shortlisted OR Hired (both have passed interview)
    const upcoming = candidatesList.filter(c => c.status === "Shortlisted" || c.status === "Hired").length;
    // Hired = only real CANDIDATE_HIRED terminal state
    const hired = candidatesList.filter(c => c.status === "Hired").length;
    const rejected = candidatesList.filter(c => c.status === "Rejected").length;
    const pipeline = candidatesList.filter(c => c.status === "In Review" || c.status === "New").length;

    const screenedPercent = total > 0 ? Math.round((screened / total) * 100) : 0;
    const upcomingPercent = total > 0 ? Math.round((upcoming / total) * 100) : 0;
    const hiredPercent = total > 0 ? Math.round((hired / total) * 100) : 0;

    return {
      kpi: [
        { title: 'Total Applications', count: total.toString(), note: 'Active parsed profiles' },
        { title: 'Selected (Hired)', count: hired.toString(), note: 'Final selection confirmed' },
        { title: 'Rejected applicants', count: rejected.toString(), note: 'Revoked portfolios' },
        { title: 'Screening in Pipeline', count: pipeline.toString(), note: 'In review or new state' }
      ],
      stages: [
        { stage: 'Applied Applications', total: `${total} candidates`, percentage: '100%', percentVal: 100, fill: 'bg-[#6342E8]' },
        { stage: 'Screened Resume Passes', total: `${screened} candidates`, percentage: `${screenedPercent}%`, percentVal: screenedPercent, fill: 'bg-[#818cf8]' },
        { stage: 'Administered Interview rounds', total: `${upcoming} candidates`, percentage: `${upcomingPercent}%`, percentVal: upcomingPercent, fill: 'bg-pink-500' },
        { stage: 'Selected & Offered Contracts', total: `${hired} candidates`, percentage: `${hiredPercent}%`, percentVal: hiredPercent, fill: 'bg-emerald-500' }
      ]
    };
  };

  // Helper to dynamically calculate source acquisition distribution
  const getSourceDistribution = () => {
    let linkedin = 0;
    let website = 0;
    let referral = 0;
    let others = 0;

    candidatesList.forEach((c, idx) => {
      if (idx % 4 === 0) linkedin += 1;
      else if (idx % 4 === 1) website += 1;
      else if (idx % 4 === 2) referral += 1;
      else others += 1;
    });

    const total = candidatesList.length;
    if (total === 0) {
      return [
        { name: "LinkedIn", value: 3, color: "#6342E8" },
        { name: "Company Website", value: 2, color: "#2563eb" },
        { name: "Employee Referral", value: 1, color: "#eab308" },
        { name: "Others", value: 0, color: "#f97316" }
      ];
    }

    return [
      { name: "LinkedIn", value: linkedin, color: "#6342E8" },
      { name: "Company Website", value: website, color: "#2563eb" },
      { name: "Employee Referral", value: referral, color: "#eab308" },
      { name: "Others", value: others, color: "#f97316" }
    ];
  };

  const filteredCandidates = getFilteredCandidates();
  const activeSkillData = getSkillDistribution(filteredCandidates);
  const activeExperienceData = getExperienceSpread(filteredCandidates);



  const sourcePieData = [
    { name: "LinkedIn", value: 675, color: "#6342E8" },
    { name: "Company Website", value: 375, color: "#2563eb" },
    { name: "Employee Referral", value: 225, color: "#eab308" },
    { name: "Others", value: 225, color: "#f97316" }
  ];

  // Helper to generate role-specific questions
  const generateInterviewQuestions = (role: string): string[] => {
    const defaultQs = [
      "Tell me about a challenging project you built. What was your role and how did you resolve technical issues?",
      "How do you stay up-to-date with emerging technologies and industry best practices?",
      "Explain the importance of optimization and performance in your daily development lifecycle.",
      "How do you handle disagreements on technical design with team members or stakeholders?",
      "Describe your ideal collaborative environment for delivering high-quality user experiences."
    ];
    switch (role) {
      case "UI/UX Designer":
        return [
          "Explain your design process. What key steps do you take when starting a new interface project?",
          "How do you conduct user research, and how does it influence your typography and color selections?",
          "What is the difference between custom UI components and established design systems in Figma?",
          "How do you ensure accessibility standards (like WCAG) are maintained in your responsive layouts?",
          "Can you describe how you handle negative user testing feedback on a design you were confident in?"
        ];
      case "Data Analyst":
        return [
          "What is the difference between data mining, data cleaning, and exploratory data profiling?",
          "Explain what a SQL window function is and give an example of when you would use it.",
          "How do you structure interactive reporting dashboards in Power BI or Tableau to be easily scannable?",
          "What is the difference between inner, left, right, and full outer database joins?",
          "Describe a time you had to clean and format a highly fragmented dataset. What was your method?"
        ];
      case "Frontend Engineer":
        return [
          "Explain the difference between Virtual DOM and Shadow DOM, and how they improve performance.",
          "Describe the CSS Box Model. What is the key difference between border-box and content-box sizing?",
          "How does JavaScript event propagation (bubbling vs. capturing) work, and how do you prevent it?",
          "What are React Hooks, and what structural rules must be followed when implementing them?",
          "How do you optimize initial page load speeds (e.g., code splitting, lazy loading, asset compression)?"
        ];
      case "Full Stack Developer":
        return [
          "What is the difference between monolithic architectures and containerized microservices?",
          "How do you design, secure, and document a production-ready RESTful API schema?",
          "Explain how you handle user authentication and stateless session management in a React/Node.js stack.",
          "What is database normalization, and when is it appropriate to denormalize database schemas?",
          "Describe how you handle Cross-Origin Resource Sharing (CORS) exceptions in your backend server."
        ];
      case "AI & ML Engineer":
        return [
          "What is the difference between supervised, unsupervised, and reinforcement machine learning model paradigms?",
          "Explain overfitting in neural networks. What regularizations or techniques do you use to mitigate it?",
          "What is the role of activation functions, and how do you choose between ReLU, Sigmoid, and Softmax?",
          "Describe how Gradient Descent optimizes learning vectors, and explain the learning rate trade-off.",
          "What are vector databases (like Pinecone), and how do they power RAG frameworks for LLM integration?"
        ];
      case "Cyber Security Analyst":
        return [
          "Explain the structural difference between symmetric and asymmetric encryption protocols.",
          "What is a Man-in-the-Middle (MitM) attack, and what security layers prevent it?",
          "How does SQL Injection work, and how do you validate user inputs to safeguard databases?",
          "What is the difference between IDS (Intrusion Detection) and IPS (Intrusion Prevention) systems?",
          "What is Cross-Site Scripting (XSS), and what measures do you take to sanitize rendering outputs?"
        ];
      case "Cloud Engineer":
        return [
          "What is Infrastructure as Code (IaC), and what are the advantages of using Terraform or CloudFormation?",
          "Explain the difference between horizontal and vertical scaling. How do you design auto-scaling policies?",
          "What is a Content Delivery Network (CDN), and how does it optimize media file distribution?",
          "How do serverless computing layers (like AWS Lambda) differ from traditional virtualization layers (like EC2)?",
          "How do you design a highly available, multi-region cloud architecture to handle disaster recovery?"
        ];
      case "Digital Marketer":
        return [
          "What is search engine optimization (SEO), and how do search engine crawler spiders index metadata?",
          "How does CPC/CPM ad bidding work, and how do you measure acquisition ROI on search advertisements?",
          "What is the difference between organic search optimization and paid search engine marketing (SEM)?",
          "How do you design and evaluate an A/B test for landing page conversion landing rates?",
          "How do you structure an email marketing campaign to optimize CTR and delivery inbox rates?"
        ];
      case "Product Manager":
        return [
          "What prioritization frameworks (e.g. RICE, MoSCoW) do you use to manage product backlogs?",
          "What is a Minimum Viable Product (MVP), and how do you define its release boundaries?",
          "How do you identify and track product metrics and Key Performance Indicators (KPIs) post-launch?",
          "How do you handle structural conflicts between engineering capability and creative design expectations?",
          "Describe a product you use daily that is poorly designed. What product roadmap features would fix it?"
        ];
      default:
        return defaultQs;
    }
  };

  // Handle scheduling an interview with date/time — saves to candidate record + triggers RSVP email
  const handleScheduleInterview = async () => {
    const { candidateName, candidateEmail, date, time, venue, interviewer, category, durationHours } = scheduleForm;
    if (!date || !time || !candidateName) return;

    setSchedulingInProgress(true);

    const formattedDate = new Date(`${date}T${time}`).toLocaleString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    // 1. Persist scheduledDate + scheduledTime to the candidate in localStorage
    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const cand = list.find((c: any) => c.name === candidateName) || {};
      const generatedQs = generateInterviewQuestions(cand.role || 'UI/UX Designer');

      const updated = list.map((c: any) =>
        c.name === candidateName
          ? {
              ...c,
              scheduledDate: date,
              scheduledTime: time,
              scheduledVenue: venue,
              scheduledInterviewer: interviewer,
              scheduledCategory: category,
              scheduledDuration: durationHours,
              interviewRSVP: 'pending',
              officialInterviewQuestions: generatedQs,
              officialInterviewAnswers: null
            }
          : c
      );
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
      setCandidatesList(prev => prev.map(c =>
        c.name === candidateName
          ? {
              ...c,
              scheduledDate: date,
              scheduledTime: time,
              scheduledVenue: venue,
              scheduledInterviewer: interviewer,
              scheduledCategory: category,
              scheduledDuration: durationHours,
              interviewRSVP: 'pending',
              officialInterviewQuestions: generatedQs,
              officialInterviewAnswers: null
            } as any
          : c
      ));
    } catch (e) {}

    // 2. Build the RSVP email body
    const rsvpEmailSubject = `CareerSphere AI: Interview Scheduled — ${formattedDate} | ${companyName}`;
    const rsvpEmailBody =
      `Dear ${candidateName},\n\n` +
      `Good Morning! We are pleased to inform you that your interview has been officially scheduled.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 INTERVIEW SCHEDULE DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Date & Time     : ${formattedDate}\n` +
      `Venue           : ${venue}\n` +
      `Interview Category: ${category}\n` +
      `Interview Duration: ${durationHours}\n` +
      `Lead Interviewer: ${interviewer}\n` +
      `Company         : ${companyName}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 ONLINE INTERVIEW QUESTIONS GENERATED\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `We have automatically generated 5 role-specific interview questions on your candidate dashboard. Please log in to your dashboard to review and submit your responses.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ RSVP REQUIRED\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Please open your CareerSphere AI student dashboard and confirm your attendance.\n` +
      `Login → Dashboard Home → Interview Invitation Banner → Confirm Attendance\n\n` +
      `Please carry the following documents:\n` +
      `  • Government-issued Photo ID (Aadhaar / Passport)\n` +
      `  • 3 printed copies of your updated resume\n` +
      `  • Academic certificates and experience letters\n\n` +
      `Kindly confirm within 24 hours.\n\n` +
      `With regards,\n` +
      `${companyName} — Talent Acquisition Team\n` +
      `${companyEmail}`;

    // 3. Save email to candidate's emails[] and push RSVP notification
    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const cand = list.find((c: any) => c.name === candidateName) || {};
      const generatedQs = generateInterviewQuestions(cand.role || 'UI/UX Designer');
      const emailMsg = {
        id: Date.now().toString(),
        subject: rsvpEmailSubject,
        body: rsvpEmailBody,
        date: new Date().toLocaleString("en-IN"),
        sender: `${companyName} — Talent Acquisition Team`,
        status: 'Interview Scheduled'
      };
      const updated = list.map((c: any) =>
        c.name === candidateName
          ? {
              ...c,
              emails: [emailMsg, ...(c.emails || [])],
              scheduledCategory: category,
              scheduledDuration: durationHours,
              interviewRSVP: 'pending',
              officialInterviewQuestions: generatedQs,
              officialInterviewAnswers: null
            }
          : c
      );
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
    } catch (e) {}

    // 4. Try actual email delivery
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: candidateEmail, subject: rsvpEmailSubject, body: rsvpEmailBody })
      });
    } catch (e) {}

    setSchedulingInProgress(false);
    setShowScheduleModal(false);
  };



  return (<div className={isDark ? 'dark' : ''}><div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] dark:bg-gradient-to-br dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-slate-900 dark:text-slate-200 flex flex-col md:flex-row font-sans relative overflow-x-hidden selection:bg-purple-500/30">
      <AntiGravityParticles />
      
      {/* PERSISTENT SIDEBAR NAVIGATION (Dark Slate Theme) */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#14183B]/[0.02] backdrop-blur-xl text-slate-700 dark:text-slate-300 flex flex-col shrink-0 text-slate-900 dark:text-white z-10 border-r border-slate-200 dark:border-white/10">
        
        {/* Logo and Wordmark */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#14183B] border border-purple-500/30 flex items-center justify-center shadow-xl dark:shadow-purple-500/20 overflow-hidden relative">
            <svg className="w-6.5 h-6.5 drop-shadow-[0_0_4px_rgba(99,66,232,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="innovative-logo-grad-rec" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" stroke="url(#innovative-logo-grad-rec)" strokeWidth="2" strokeDasharray="12 6" style={{ animation: "spin 12s linear infinite" }} />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-rec)" strokeWidth="2" transform="rotate(-45 50 50)" opacity="0.75" />
              <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#innovative-logo-grad-rec)" strokeWidth="2" transform="rotate(45 50 50)" opacity="0.75" />
              <circle cx="50" cy="50" r="18" fill="#14183B" stroke="url(#innovative-logo-grad-rec)" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="12" fill="url(#innovative-logo-grad-rec)" opacity="0.15" className="animate-pulse" />
              <text x="50" y="57" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="system-ui, sans-serif" textAnchor="middle">C</text>
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-sm block tracking-tight">CareerSphere AI</span>
            <span className="text-[9px] font-mono tracking-widest text-purple-400 block uppercase">Hiring Portal</span>
          </div>
        </div>

        {/* Enterprise plan tier visual bar */}
        <div className="p-4 px-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#14183B]/5 space-y-1">
          <span className="text-[8px] font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 block">Organization Tier</span>
          <div className="flex items-center gap-2">
            <span className="bg-purple-502 bg-purple-600 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">Enterprise Plan</span>
          </div>
        </div>

        {/* Navigation list menu */}
        <nav className="flex-1 p-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Pipeline Overview', icon: Users },
            { id: 'jobs', label: 'Manage Jobs', icon: Globe },
            { id: 'applications', label: 'Job Applications', icon: Briefcase },
            { id: 'analytics', label: 'Candidate Analytics', icon: BarChart3 },
            { id: 'candidate-profile', label: 'Candidate Spotlight', icon: GraduationCap },
            { id: 'interviews', label: 'Interviews Scheduled', icon: Calendar },
            { id: 'reports', label: 'Hiring Funnel Reports', icon: Building2 },
            { id: 'settings', label: 'Corporate Profile', icon: Settings }
          ].map((nav) => {
            const Icon = nav.icon;
            const isSelected = tab === nav.id;
            const hasNotification = nav.id === 'applications' && candidatesList.some(c => c.newApplicationNotification);
            return (
              <button
                key={nav.id}
                onClick={() => { setTab(nav.id as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? "bg-[#6342E8] text-white shadow-lg shadow-purple-500/15 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-[#14183B]/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3.5 text-left">
                  <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
                  <span>{nav.label}</span>
                </div>
                {hasNotification && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 border border-[#0B0E2E] shadow-xs"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Portal Switch and Support details */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          {userRole !== 'recruiter' && (
            <button
              id="btn-return-candidate"
              onClick={onNavigateToCandidate}
              className="w-full bg-[#1D174F] hover:bg-slate-800 text-purple-300 hover:text-slate-900 dark:text-white border border-purple-500/10 text-[11px] py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              ← Candidate Workspace
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
      

      {/* CORE WORKSPACE RECRUITER CONSOLE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen" id="recruiter-console">
        
        {/* TOP CONTROL BAR & SEARCH SUITE */}
        <header className="bg-white dark:bg-[#14183B]/[0.02] backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 py-3 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 z-10 shrink-0 select-none">
          <div>
            <h2 className="text-md font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Good Morning, {userName || "Recruiter"}! 👋</span>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-500/20 text-purple-800 dark:text-purple-300 rounded-full px-2 py-0.5 tracking-wider font-mono font-bold">HR MANAGER VIEW</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 self-end justify-between sm:justify-start w-full sm:w-auto text-slate-700 dark:text-slate-300">
            {/* Search Input with live dropdown */}
            <div className="relative max-w-xs w-fit">
              <Search className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 absolute top-2.5 left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(e.target.value.trim().length > 0); }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSearchDropdown(true)}
                placeholder="Search candidates..."
                className="bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-lg text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-900 dark:text-white font-medium focus:bg-white dark:bg-[#14183B]/10 w-48"
              />
              {/* Search results dropdown */}
              {showSearchDropdown && (() => {
                const q = searchQuery.toLowerCase();
                const results = candidatesList.filter(c =>
                  c.name.toLowerCase().includes(q) ||
                  c.role.toLowerCase().includes(q) ||
                  (c.email || '').toLowerCase().includes(q)
                ).slice(0, 6);
                return results.length > 0 ? (
                  <div className="absolute top-full mt-1.5 left-0 w-72 bg-[#0B0E2E] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-3 py-2 text-[9px] font-mono tracking-widest text-slate-500 uppercase border-b border-slate-200 dark:border-white/10">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                    {results.map((cand) => (
                      <button
                        key={cand.id}
                        onMouseDown={() => {
                          setSelectedCandidate(cand.name);
                          setTab('candidate-profile'); setIsSidebarOpen(false);
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/5 transition-all text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/20 flex items-center justify-center font-black text-xs text-purple-300 shrink-0 overflow-hidden">
                          {cand.photo ? (
                            <img src={cand.photo} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            cand.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-slate-900 dark:text-white text-xs font-bold block truncate">{cand.name}</span>
                          <span className="text-slate-600 dark:text-slate-400 text-[10px] block truncate">{cand.role} • {cand.status}</span>
                        </div>
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 ${
                          cand.status === 'Hired' ? 'bg-amber-500/20 text-amber-300' :
                          cand.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-300' :
                          cand.status === 'Rejected' ? 'bg-rose-50 text-rose-300' :
                          'bg-purple-50 text-purple-300'
                        }`}>{cand.status === 'Hired' ? '✓ Hired' : cand.status}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="absolute top-full mt-1.5 left-0 w-64 bg-[#0B0E2E] border border-white/15 rounded-xl shadow-2xl z-50 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    No candidates match "{searchQuery}"
                  </div>
                );
              })()}
            </div>

            {/* Theme Toggle */}
            <button onClick={() => setIsDark(!isDark)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/10 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Bell icon — notification panel toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(v => !v)}
                className="relative p-1.5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/10 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
                {candidatesList.filter(c => c.newApplicationNotification || c.newInterviewAnswersNotification).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#0B0E2E]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifPanel && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0B0E2E] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">System Notifications</span>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {candidatesList.filter(c => c.newApplicationNotification || c.newInterviewAnswersNotification).length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-600 dark:text-slate-400">No new notifications</div>
                        ) : (
                          candidatesList.filter(c => c.newApplicationNotification || c.newInterviewAnswersNotification).map(cand => (
                            <div key={cand.id} className="px-4 py-3 space-y-2">
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center font-black text-[10px] text-purple-700 dark:text-purple-300 shrink-0 overflow-hidden">
                                  {cand.photo ? <img src={cand.photo} alt="Avatar" className="w-full h-full object-cover" /> : cand.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-slate-900 dark:text-white text-xs font-bold block">{cand.name}</span>
                                  <span className="text-slate-600 dark:text-slate-400 text-[10px] block">
                                    {cand.newInterviewAnswersNotification ? "Submitted answers for" : "Applied for"}: <strong className="text-purple-500 dark:text-purple-300">{cand.role}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    try {
                                      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
                                      const list = JSON.parse(stored);
                                      const updated = list.map((c) => c.name === cand.name ? { ...c, newInterviewAnswersNotification: false, newApplicationNotification: false } : c);
                                      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
                                      // @ts-ignore
                                      if (typeof setCandidatesList === 'function') setCandidatesList(updated);
                                    } catch (e) {}
                                  }}
                                  className="flex-1 bg-slate-100 dark:bg-[#14183B]/10 hover:bg-slate-200 dark:bg-[#14183B]/15 text-slate-700 dark:text-slate-300 font-bold py-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                                >
                                  Dismiss
                                </button>
                                <button
                                  onClick={() => {
                                    // @ts-ignore
                                    if(typeof setSelectedCandidate === 'function') setSelectedCandidate(cand.name);
                                    // @ts-ignore
                                    if(typeof setTab === 'function') setTab('candidate-profile');
                                    // @ts-ignore
                                    if(typeof setIsSidebarOpen === 'function') setIsSidebarOpen(false);
                                    // @ts-ignore
                                    if(typeof setShowNotifPanel === 'function') setShowNotifPanel(false);
                                  }}
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* RECRUITER CONTENT WORKSPACE BOARD */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">

            
            {/* TAB: MANAGE JOBS */}
            {tab === 'jobs' && (
              <motion.div 
                key="recruiter-jobs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Manage Job Postings</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Post new job openings and manage existing ones. These will be visible to students.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingJobId(null);
                      setJobForm({ title: '', role: 'UI/UX Designer', location: 'Remote', salary: '₹5 - 8 LPA', skills: '' });
                      setShowJobModal(true);
                    }}
                    className="bg-[#6342E8] hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </button>
                </div>

                {postedJobs.length === 0 ? (
                  <div className="bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Jobs Posted Yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">You haven't posted any jobs. Click "Post New Job" to create your first listing.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postedJobs.map((job) => (
                      <div key={job.id} className="bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {job.role}
                          </span>
                          {job.isActive === false && (
                            <span className="ml-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Hidden
                            </span>
                          )}
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                setEditingJobId(job.id);
                                setJobForm({ title: job.title, role: job.role, location: job.location, salary: job.salary, skills: (job.skills || []).join(', ') });
                                setShowJobModal(true);
                              }}
                              className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleToggleJobVisibility(job.id, job.isActive !== false)}
                              className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                            >
                              {job.isActive !== false ? 'Hide' : 'Republish'}
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{job.title}</h4>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 mb-4 flex-1">
                          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {job.location}</div>
                          <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {job.salary}</div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-slate-100 dark:border-white/5">
                          {(job.skills || []).slice(0,3).map((skill, i) => (
                            <span key={i} className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[9px] font-medium px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {(job.skills || []).length > 3 && (
                            <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[9px] font-medium px-1.5 py-0.5 rounded">
                              +{(job.skills.length - 3)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* JOB MODAL */}
            <AnimatePresence>
              {showJobModal && (
                <>
                  <div className="fixed inset-0 bg-[#0B0E2E]/60 backdrop-blur-sm z-50" onClick={() => setShowJobModal(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-[#0B0E2E] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                  >
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {editingJobId ? 'Edit Job Posting' : 'Post New Job'}
                      </h3>
                      <button onClick={() => setShowJobModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSaveJob} className="p-5 space-y-4 overflow-y-auto">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Job Title</label>
                        <input type="text" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Senior Product Designer" className="w-full bg-slate-50 dark:bg-[#14183B]/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Role Category</label>
                        <select required value={jobForm.role} onChange={e => setJobForm({...jobForm, role: e.target.value})} className="w-full bg-slate-50 dark:bg-[#14183B]/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500">
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="Frontend Engineer">Frontend Engineer</option>
                          <option value="Data Analyst">Data Analyst</option>
                          <option value="Product Manager">Product Manager</option>
                          <option value="Digital Marketer">Digital Marketer</option>
                          <option value="Cloud Engineer">Cloud Engineer</option>
                          <option value="Cyber Security Analyst">Cyber Security Analyst</option>
                          <option value="Full Stack Developer">Full Stack Developer</option>
                          <option value="AI & ML Engineer">AI & ML Engineer</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                          <input type="text" required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. Remote" className="w-full bg-slate-50 dark:bg-[#14183B]/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Salary Range</label>
                          <input type="text" required value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="e.g. ₹5 - 8 LPA" className="w-full bg-slate-50 dark:bg-[#14183B]/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Required Skills (Comma separated)</label>
                        <input type="text" required value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} placeholder="e.g. Figma, React, Communication" className="w-full bg-slate-50 dark:bg-[#14183B]/30 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">Cancel</button>
                        <button type="submit" className="bg-[#6342E8] hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-xl text-xs cursor-pointer shadow-lg shadow-purple-500/20 transition-all">
                          {editingJobId ? 'Save Changes' : 'Post Job'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* TAB: DASHBOARD OVERVIEW (Screen 19) */}
            {tab === 'dashboard' && (
              <motion.div 
                key="recruiter-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Greeting description */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Organization Pipeline Overview</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Monitor candidate application volumes, shortlist targets, and scheduling pass rates in real-time.</p>
                </div>

                {/* Live Job Application Notifications */}
                {candidatesList.some(c => c.newApplicationNotification) && (
                  <div className="space-y-3">
                    {candidatesList.filter(c => c.newApplicationNotification).map((cand) => (
                      <div 
                        key={cand.id} 
                        className="p-4 bg-[#1D174F] border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-900 dark:text-white shadow-lg animate-pulse"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-300 border border-purple-500/30">
                            <Bell className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">New Job Application!</span>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                              <strong>{cand.name}</strong> has applied for the <strong>{cand.appliedJobTitle}</strong> position at <strong>{cand.appliedJobCompany}</strong>.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleApproveApplication(cand.name)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer"
                          >
                            Approve & Invite
                          </button>
                          <button 
                            onClick={() => handleRejectApplication(cand.name)}
                            className="bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scorecard KPI summaries (4 Metrics) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Total Candidates", val: candidatesList.length.toString(), change: "Registered database", good: true, bg: "bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10" },
                    { title: "Interviews Scheduled", val: candidatesList.filter(c => c.status === "Shortlisted").length.toString(), change: "Shortlisted cands", good: true, bg: "bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10" },
                    { title: "Selected Applicants", val: candidatesList.filter(c => c.status === "Shortlisted").length.toString(), change: "Selected targets", good: true, bg: "bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10" },
                    { title: "Open Positions", val: "8", change: "Active open posts", good: true, bg: "bg-white dark:bg-[#14183B] border-slate-200 dark:border-white/10" }
                  ].map((metric, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${metric.bg} shadow-xs space-y-2`}>
                      <span className="text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-400 block uppercase font-bold">{metric.title}</span>
                      <div className="flex justify-between items-baseline">
                        <strong className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{metric.val}</strong>
                        <span className="text-[9px] font-mono text-slate-500 font-semibold">{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shaded Area Chart & Applications Sheet (Screen 19 content grid 50/50) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Candidate Overview Volume Graph (Span 7) */}
                  <div className="lg:col-span-7 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#6342E8]" />
                        <span>Weekly Candidates Velocity</span>
                      </h4>
                      <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">{peakLabel}</span>
                    </div>

                    {/* Area Graph Shaded Recharts */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dynamicGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6342E8" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6342E8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip formatter={(value) => [`${value} Applicants`, 'Volume']} />
                          <Area type="monotone" dataKey="Candidates" stroke="#6342E8" strokeWidth={3} fillOpacity={1} fill="url(#colorCandidates)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Spreadsheet table (Span 5) */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Recent Active App Resumes</h4>
                    
                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[265px] pr-1">
                      {candidatesList.map((cand) => (
                        <div 
                          key={cand.id} 
                          onClick={() => {
                            setSelectedCandidate(cand.name);
                            setTab('candidate-profile'); setIsSidebarOpen(false);
                          }}
                          className="py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-white/5 rounded-xl px-2 transition-all cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{cand.name}</span>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 block">{cand.role} • {cand.exp}</span>
                          </div>
                          
                          <div className="text-right flex items-center gap-3">
                            <div className="hidden sm:block">
                              <span className="text-emerald-600 text-xs font-mono font-bold block">{cand.match}%</span>
                              <span className="text-[8px] text-slate-600 dark:text-slate-400 block tracking-widest uppercase font-mono">RELEVANCE</span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              cand.status === "Hired" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              cand.status === "Shortlisted" ? "bg-emerald-100 text-emerald-800" :
                              cand.status === "In Review" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange-700"
                            }`}>{cand.status === "Hired" ? "✓ Hired" : cand.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: JOB APPLICATIONS */}
            {tab === 'applications' && (
              <motion.div 
                key="recruiter-applications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Job Applications</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Review candidates who have applied directly to Nexis AI Solutions and Freshworks positions from the student portal.</p>
                </div>

                <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs select-none font-sans">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-slate-500 font-mono tracking-wider">
                          <th className="p-4 uppercase font-extrabold">Candidate Name</th>
                          <th className="p-4 uppercase font-extrabold">Target Role</th>
                          <th className="p-4 uppercase font-extrabold">Applied Position</th>
                          <th className="p-4 uppercase font-extrabold">ATS Match</th>
                          <th className="p-4 uppercase font-extrabold">Status</th>
                          <th className="p-4 uppercase font-extrabold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
                        {(() => {
                          const appliedCands = candidatesList.filter(c => c.appliedJobTitle);
                          if (appliedCands.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-600 dark:text-slate-400 font-medium font-sans">
                                  No candidates have applied for jobs yet. Applied profiles will display here for evaluation.
                                </td>
                              </tr>
                            );
                          }
                          return appliedCands.map((cand) => {
                            const isApproved = cand.status === "Approved" || cand.status === "Shortlisted";
                            const isRejected = cand.status === "Rejected";
                            const matchScore = cand.match || 0;
                            return (
                              <tr key={cand.id} className="hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-transparent transition-colors cursor-pointer">
                                <td className="p-4">
                                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">{cand.name}</div>
                                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{cand.email}</div>
                                </td>
                                <td className="p-4 text-slate-700 dark:text-slate-300 font-bold">{cand.role}</td>
                                <td className="p-4">
                                  <div className="font-bold text-slate-800 dark:text-slate-200">{cand.appliedJobTitle}</div>
                                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{cand.appliedJobCompany}</div>
                                </td>
                                <td className="p-4 font-mono font-bold">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    matchScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                                  }`}>
                                    {matchScore}%
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono tracking-wider ${
                                    isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                    isRejected ? "bg-rose-100 text-rose-800 border border-rose-200" :
                                    "bg-purple-100 text-purple-800 border border-purple-200"
                                  }`}>
                                    {cand.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2.5 justify-end items-center">
                                    <button 
                                      onClick={() => handleDownloadResume(cand)}
                                      className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-white/5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs bg-white dark:bg-[#14183B] shrink-0 active:scale-95"
                                    >
                                      Resume details
                                    </button>
                                    {cand.status === "Hired" ? (
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[9px] font-black font-mono uppercase tracking-wider">✓ Hired</span>
                                        <button
                                          onClick={() => openEmailModal(cand, 'Hire')}
                                          className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                        >
                                          Resend Offer
                                        </button>
                                      </div>
                                    ) : cand.status === "Applied" ? (
                                      <>
                                        <button
                                          onClick={() => handleApproveApplication(cand.name)}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                        >
                                          Approve & Invite
                                        </button>
                                        <button
                                          onClick={() => handleRejectApplication(cand.name)}
                                          className="bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-extrabold px-3 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium italic select-none">
                                          {isApproved ? "Approved" : "Rejected"}
                                        </span>
                                        {isApproved && (
                                          <button
                                            onClick={() => handleHireCandidate(cand.name)}
                                            className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                          >
                                            Finalize Hire →
                                          </button>
                                        )}
                                        <button
                                          onClick={() => openEmailModal(cand, isApproved ? 'Approve' : 'Custom')}
                                          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                        >
                                          Send Custom Email
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: CANDIDATE ANALYTICS (Screen 20) */}
            {tab === 'analytics' && (
              <motion.div 
                key="candidate-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header segment sorting */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Candidate Recruitment Analytics</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Track and audit corporate metrics regarding parsed technical assets and experience distributions.</p>
                  </div>
                  
                  {/* Action download report */}
                  <button 
                    onClick={handleDownloadReport}
                    className="bg-[#6342E8] hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex gap-2 items-center cursor-pointer shadow-xs active:scale-95"
                  >
                    <Download className="w-4 h-4 text-slate-900 dark:text-white" /> Download Excel Report
                  </button>
                </div>

                {/* Staggered filters toolbar */}
                <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl flex flex-wrap gap-3 items-center justify-between shadow-xs select-none">
                  <div className="flex flex-wrap gap-2.5 items-center text-xs">
                    <span className="font-mono text-slate-500 uppercase block font-bold">FILTERS:</span>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-lg py-1 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#6342E8] font-semibold cursor-pointer"
                    >
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >All Roles</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Data Analyst</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Frontend Engineer</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >AI & ML Engineer</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Cyber Security Analyst</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Cloud Engineer</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Digital Marketer</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Product Manager</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >UI/UX Designer</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Full Stack Developer</option>
                    </select>
                    <select 
                      value={expFilter}
                      onChange={(e) => setExpFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-lg py-1 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#6342E8] font-semibold cursor-pointer"
                    >
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >All Experience Brackets</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >1-3 Years</option>
                      <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >3-5 Years</option>
                    </select>
                  </div>
                </div>

                {/* Charting Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Skill Distribution Donut chart (Column 6) */}
                  <div className="md:col-span-6 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Parsed Primary Skill distribution</h4>
                    
                    <div className="h-64 flex flex-col md:flex-row items-center gap-6">
                      <div className="relative w-48 h-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activeSkillData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {activeSkillData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Candidates`]} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Centered text counts */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <strong className="text-lg font-black text-slate-900 dark:text-white leading-none">{candidatesList.length}</strong>
                          <span className="text-[8px] text-slate-405 tracking-widest uppercase block font-mono">CANDIDATES</span>
                        </div>
                      </div>

                      {/* Legend detail list */}
                      <div className="flex-1 space-y-1.5 text-xs">
                        {activeSkillData.map((legend, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-650">
                            <div className="flex gap-2 items-center">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: legend.color }}></span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{legend.name}</span>
                            </div>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{legend.percentage} ({legend.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Experience spread column graph (Column 6) */}
                  <div className="md:col-span-6 bg-white dark:bg-[#14183B] border border-slate-207 border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Parsed Candidates Experience Bracket</h4>
                    
                    {/* Vertical Recharts Column chart */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={activeExperienceData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip formatter={(value) => [`${value} Candidates`, 'Spread']} />
                          <Bar dataKey="Candidates" fill="#6342E8" radius={[4, 4, 0, 0]}>
                            {activeExperienceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 1 ? "#ec4899" : "#6342E8"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Talent Insights & Hiring Trends (Col-span-12) */}
                  <div className="md:col-span-12 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#6342E8]" />
                      <span>Corporate Hiring Insights & Trends</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {getHiringInsights().map((insight, idx) => (
                        <div key={idx} className="p-4 bg-purple-50/40 border border-purple-100/50 rounded-2xl text-slate-700 dark:text-slate-300 font-medium">
                          • {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: CANDIDATE PROFILE SPOTLIGHT (Screen 21) */}
            {tab === 'candidate-profile' && (
              <motion.div 
                key="candidate-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Back Link Header & Candidate Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <button 
                    onClick={() => { setTab('dashboard'); setIsSidebarOpen(false); }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard overview
                  </button>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-xl p-2 px-3 shadow-xs">
                    <span className="font-bold text-slate-500 font-mono uppercase tracking-wider text-[10px]">Select Candidate:</span>
                    <select
                      value={selectedCandidate}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {candidatesList.map(cand => (
                        <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" key={cand.id} value={cand.name}>{cand.name} ({cand.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(() => {
                  const candDetails = candidatesList.find(c => c.name === selectedCandidate) || {
                    id: "yogeshwari",
                    name: selectedCandidate || "Yogeshwari",
                    role: "UI/UX Designer",
                    exp: "2-4 yrs",
                    match: 96,
                    status: "Shortlisted",
                    email: "yogeshwari@email.com",
                    phone: "+91 98765 43210",
                    interviewsTaken: []
                  };
                  const scoreVal = candDetails.resumeScore || candDetails.match || 75;
                  const evaluation = getCandidateEvaluation({ ...candDetails, match: scoreVal });

                  const initialChar = (candDetails.name.charAt(0) || "Y").toUpperCase();
                  const cEmail = candDetails.email || (candDetails.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@email.com");
                  const cPhone = "+91 98765 43210";
                  const strokeOffset = 251.2 - (251.2 * scoreVal) / 100;
                  
                  return (
                    <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-6 shadow-xs select-none">
                      
                      {/* Spotlight core elements */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                          <div className="w-16 h-16 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center font-black text-2xl text-[#6342E8] overflow-hidden">
                            {candDetails.photo ? (
                              <img src={candDetails.photo} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              initialChar
                            )}
                          </div>
                          <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                              <h4 className="text-lg font-black text-slate-900 dark:text-white">{candDetails.name}</h4>
                              <span className="w-fit mx-auto bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase font-mono">{scoreVal}% MATCH SCORE</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Target Position: {candDetails.role} • Chennai, India</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{cEmail} • {cPhone}</p>
                          </div>
                        </div>

                        {/* Action buttons (Shortlist, interview, reject, approve, hire) */}
                        <div className="flex flex-wrap gap-2.5 shrink-0 justify-center">
                          {candDetails.status === 'Hired' ? (
                            <>
                              <span className="flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-black">
                                ✓ Hired — Offer Issued
                              </span>
                              <button
                                onClick={() => openEmailModal(candDetails, 'Hire')}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Resend Offer Letter
                              </button>
                            </>
                          ) : candDetails.appliedJobTitle ? (
                            <>
                              {candDetails.status === 'Shortlisted' && (
                                <button
                                  onClick={() => handleHireCandidate(candDetails.name)}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs ring-2 ring-amber-300/50"
                                >
                                  🎉 Mark as Hired
                                </button>
                              )}
                              <button
                                onClick={() => handleApproveApplication(candDetails.name)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Approve for Interview
                              </button>
                              <button
                                onClick={() => handleRejectApplication(candDetails.name)}
                                className="bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Reject Profile
                              </button>
                              <button
                                onClick={() => openEmailModal(candDetails, candDetails.status === 'Shortlisted' ? 'Approve' : 'Custom')}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Send Custom Email
                              </button>
                            </>
                          ) : (
                            <>
                              {candDetails.status === 'Shortlisted' && (
                                <button
                                  onClick={() => handleHireCandidate(candDetails.name)}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs ring-2 ring-amber-300/50"
                                >
                                  🎉 Mark as Hired
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(candDetails.name, "Shortlisted")}
                                className="bg-[#6342E8] hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Shortlist Candidate
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Interview schedule setup sent successfully in organizational calendar for ${candDetails.name}.`);
                                  setTab('interviews'); setIsSidebarOpen(false);
                                }}
                                className="bg-white dark:bg-[#14183B] hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                              >
                                Schedule Interview
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(candDetails.name, "Rejected")}
                                className="bg-white dark:bg-[#14183B] hover:bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 transition-all cursor-pointer"
                              >
                                Reject Profile
                              </button>
                              <button
                                onClick={() => openEmailModal(candDetails, candDetails.status === 'Shortlisted' ? 'Approve' : 'Custom')}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Send Custom Email
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Summary Tiles details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-2xl select-none">
                        {[
                          { title: 'Requisite Experience', details: candDetails.exp || 'Fresher' },
                          { title: 'Current Target Role', details: candDetails.role },
                          { title: 'Interviews Administered', details: candDetails.resumeScore ? '1 Assessment Evaluated' : 'Onboarding Setup' },
                          { title: 'Screening Status', details: candDetails.status }
                        ].map((tile, i) => (
                          <div key={i} className="text-center md:text-left space-y-1">
                            <span className="text-[9px] font-mono tracking-widest text-slate-600 dark:text-slate-400 uppercase block font-bold">{tile.title}</span>
                            <strong className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{tile.details}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Information block descriptions */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-4">
                          
                          {/* About profile details */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">About Candidate Profile</h5>
                            <p className="text-xs text-slate-650 leading-relaxed text-slate-600 dark:text-slate-400 font-medium text-justify">
                              {evaluation.about}
                            </p>
                          </div>

                          {/* Uploaded Resume Document details */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Uploaded Resume Document</h5>
                              <div className="mt-2">
                                {candDetails.resumeFileData ? (
                                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                                    <iframe 
                                      src={candDetails.resumeFileData} 
                                      className="w-full h-full object-cover bg-white dark:bg-[#14183B]"
                                      title={`${candDetails.name} Resume Preview`}
                                    />
                                    <button 
                                      onClick={() => handleDownloadResume(candDetails)}
                                      className="w-full py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                                    >
                                      Download Original Resume
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                      <Briefcase className="w-5 h-5 stroke-[2]" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{candDetails.resumeFileName || `${candDetails.name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`}</span>
                                      <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-mono">Parsed Document Asset • PDF Document</span>
                                    </div>
                                    <button 
                                      onClick={() => handleDownloadResume(candDetails)}
                                      className="text-xs text-[#6342E8] hover:text-purple-700 font-extrabold cursor-pointer border border-[#6342E8]/20 bg-white dark:bg-[#14183B] px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-white/5 transition-all select-none active:scale-95"
                                    >
                                      Download Resume
                                    </button>
                                  </div>
                                )}
                              </div>
                          </div>

                          {/* Official Q&A Submissions */}
                          {candDetails.officialInterviewAnswers && (
                            <div className="space-y-4 p-5 bg-purple-50/50 border border-purple-200/60 rounded-3xl text-xs text-left">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-black text-purple-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                  <span>📝 Official Interview Answers Sheet</span>
                                </h5>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  candDetails.status === 'Hired' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                  candDetails.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                  'bg-purple-100 text-purple-800 border border-purple-300'
                                }`}>
                                  {candDetails.status}
                                </span>
                              </div>

                              <div className="space-y-4">
                                {candDetails.officialInterviewQuestions.map((q: string, qIdx: number) => (
                                  <div key={qIdx} className="space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 flex gap-1.5">
                                      <span className="text-purple-600 font-mono">Q{qIdx + 1}:</span>
                                      <span>{q}</span>
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-[#14183B]/70 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 leading-relaxed font-semibold italic">
                                      "{candDetails.officialInterviewAnswers[qIdx]}"
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Selection/Rejection Actions */}
                              {candDetails.status === 'In Review' && (
                                <div className="flex gap-2.5 pt-2.5 border-t border-purple-100">
                                  <button
                                    onClick={() => handleHireCandidate(candDetails.name)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xl dark:shadow-purple-500/20"
                                  >
                                    ✓ Approve & Hire
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(candDetails.name)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xl dark:shadow-purple-500/20"
                                  >
                                    ✗ Reject Candidate
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Official Scheduled Interview Result */}
                          {candDetails.officialInterviewResult && (
                            <div className="space-y-4 p-5 bg-purple-50/50 border border-purple-200/60 rounded-3xl text-xs text-left">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-black text-purple-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                  <span>🎯 Official Scheduled Interview Result</span>
                                </h5>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  candDetails.officialInterviewResult.approvedOrRejected === 'Approved' || candDetails.status === 'Shortlisted' || candDetails.status === 'Hired' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                  candDetails.officialInterviewResult.approvedOrRejected === 'Rejected' || candDetails.status === 'Rejected' ? 'bg-rose-100 text-rose-850 text-rose-800 border border-rose-300' :
                                  'bg-purple-100 text-purple-800 border border-purple-300'
                                }`}>
                                  {candDetails.officialInterviewResult.approvedOrRejected === 'Approved' || candDetails.status === 'Shortlisted' || candDetails.status === 'Hired' ? 'Approved ✓' :
                                   candDetails.officialInterviewResult.approvedOrRejected === 'Rejected' || candDetails.status === 'Rejected' ? 'Rejected' :
                                   'Pending Evaluation'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 bg-white dark:bg-[#14183B]/70 border border-purple-100 p-3 rounded-2xl select-none">
                                <div>
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 block font-bold">Evaluation Score</span>
                                  <strong className="text-base font-black text-[#6342E8] font-mono">{candDetails.officialInterviewResult.score}%</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 block font-bold">Completion Date</span>
                                  <strong className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">{candDetails.officialInterviewResult.date}</strong>
                                </div>
                              </div>

                              {/* Questions & Answers */}
                              {candDetails.officialInterviewResult.qas && candDetails.officialInterviewResult.qas.length > 0 && (
                                <div className="space-y-3">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 block font-bold">Transcript & Responses</span>
                                  <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-purple-100/50 pr-1">
                                    {candDetails.officialInterviewResult.qas.map((qa: any, qIdx: number) => (
                                      <div key={qIdx} className="pt-2.5 first:pt-0 space-y-1">
                                        <div className="font-bold text-slate-850 text-slate-800 dark:text-slate-200 flex gap-1.5">
                                          <span className="text-purple-600 font-mono">Q{qIdx + 1}:</span>
                                          <span>{qa.question}</span>
                                        </div>
                                        <div className="text-slate-600 dark:text-slate-400 bg-white dark:bg-[#14183B]/50 border border-slate-100 dark:border-white/5 rounded-xl p-2.5 leading-relaxed font-semibold italic">
                                          "{qa.answer}"
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* AI Feedback Points */}
                              {candDetails.officialInterviewResult.feedback && candDetails.officialInterviewResult.feedback.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 block font-bold font-mono">AI Evaluation Insights</span>
                                  <ul className="list-disc pl-4 space-y-1 text-slate-650 text-slate-600 dark:text-slate-400 font-semibold">
                                    {candDetails.officialInterviewResult.feedback.map((f: string, fIdx: number) => (
                                      <li key={fIdx}>{f}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Selection/Rejection Actions */}
                              {candDetails.officialInterviewResult.approvedOrRejected === 'Pending' && candDetails.status !== 'Rejected' && candDetails.status !== 'Shortlisted' && candDetails.status !== 'Hired' && (
                                <div className="flex gap-2.5 pt-2 border-t border-purple-100">
                                  <button
                                    onClick={() => handleApproveOfficialInterview(candDetails.name)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xl dark:shadow-purple-500/20"
                                  >
                                    ✓ Approve & Release Offer
                                  </button>
                                  <button
                                    onClick={() => handleRejectOfficialInterview(candDetails.name)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-xl dark:shadow-purple-500/20"
                                  >
                                    ✗ Reject Candidate
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Completed Mock Interviews */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Completed Mock Interviews</h5>
                            {candDetails.interviewsTaken && candDetails.interviewsTaken.length > 0 ? (
                              <div className="space-y-2">
                                {candDetails.interviewsTaken.map((session: any, idx: number) => (
                                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                                    <div className="space-y-1">
                                      <div className="font-bold text-slate-800 dark:text-slate-200">{session.category} • <span className="font-mono text-purple-600">{session.difficulty}</span></div>
                                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                                        Role Target: {session.role} • Date Completed: {session.date}
                                      </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <div className="font-bold text-emerald-600 font-mono">{session.score}% Score</div>
                                      <div className="text-[9px] text-slate-600 dark:text-slate-400 font-mono">Duration: {session.duration} mins</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-center text-xs text-slate-500 font-medium">
                                No AI mock interviews completed yet by this candidate.
                              </div>
                            )}
                          </div>

                          {/* Skills matrix grids list */}
                          <div className="space-y-2.5">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Competencies scores</h5>
                            
                            <div className="space-y-2">
                              {evaluation.competencies.map((comp, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    <span>{comp.name}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{comp.score}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#6342E8] h-full" style={{ width: `${comp.score}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Resume Score visual (Column 4) */}
                        <div className="md:col-span-4 bg-slate-50 dark:bg-white/5 border border-slate-150 p-5 rounded-2xl h-fit text-center space-y-4">
                          <span className="text-[9px] font-mono tracking-widest text-slate-600 dark:text-slate-400 uppercase block font-bold">Resume Score Indicator</span>

                          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="rgba(0,0,0,0.05)" strokeWidth="6" fill="transparent" />
                              <circle cx="48" cy="48" r="40" stroke="#6342E8" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={strokeOffset} strokeLinecap="round" />
                            </svg>
                            <strong className="absolute text-xl font-black text-slate-800 dark:text-slate-200">{scoreVal}/100</strong>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                            {evaluation.feedback}
                          </p>
                        </div>
                      </div></div>);
                })()}
              </motion.div>
            )}

            {/* TAB: INTERVIEWS SCHEDULE TRACKER (Screen 22) */}
            {tab === 'interviews' && (
              <motion.div 
                key="interviews"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Interview Scheduling Management</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Schedule and manage pipeline review tasks in real-time.</p>
                  </div>

                  <button
                    onClick={() => {
                      const first = candidatesList.find(c => c.status === 'Shortlisted' || c.status === 'Hired') || candidatesList[0];
                      if (first) {
                        setScheduleForm(f => ({
                          ...f,
                          candidateId: first.id,
                          candidateName: first.name,
                          candidateEmail: first.email,
                          venue: companyAddress || 'Nexis AI Solutions, Tidel Park, Tharamani, Chennai — 600113'
                        }));
                      }
                      setShowScheduleModal(true);
                    }}
                    className="bg-[#6342E8] hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                  >
                    + Schedule New Interview
                  </button>
                </div>

                {/* Scorecard grids stats lists */}
                {(() => {
                  const metrics = getInterviewMetrics();
                  const scData = [
                    { t: 'Upcoming Interviews', v: metrics.upcoming.toString(), ch: '+12% from last week' },
                    { t: 'Completed Interviews', v: metrics.completed.toString(), ch: '+8% from last week' },
                    { t: 'Cancelled Interviews', v: metrics.cancelled.toString(), ch: '-3% from last week' },
                    { t: 'Interview Pass Rate', v: metrics.passRate, ch: '+10% from last week' }
                  ];
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                      {scData.map((sc, index) => (
                        <div key={index} className="p-4 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs">
                          <span className="text-[9px] font-mono tracking-widest text-[#6342e8] uppercase block font-extrabold">{sc.t}</span>
                          <strong className="text-xl font-black block mt-1.5 text-slate-900 dark:text-white">{sc.v}</strong>
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 block mt-1">{sc.ch}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Grid layout scheduler schedule sheets */}
                <div className="bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-105 border-slate-100 dark:border-white/5 text-slate-550 text-slate-500 font-mono tracking-wider">
                          <th className="p-4 uppercase">Candidate Name</th>
                          <th className="p-4 uppercase">Category</th>
                          <th className="p-4 uppercase">Date & Hours</th>
                          <th className="p-4 uppercase">Lead Interviewer</th>
                          <th className="p-4 uppercase">Schedule State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
                        {getInterviewsList().length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                              No interviews scheduled yet. Shortlist candidates to set up schedules.
                            </td>
                          </tr>
                        ) : (
                          getInterviewsList().map((item, idx) => {
                            const badstyle = item.schedule_state === "Hired ✓"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : item.schedule_state === "Upcoming"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : item.schedule_state === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.schedule_state === "Cancelled"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-purple-50 text-purple-700 border border-purple-200";

                            return (
                              <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer ${item.is_hired ? "bg-amber-50/40 dark:bg-amber-900/20" : "dark:bg-transparent"}`}>
                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                  <span className="flex items-center gap-2">
                                    {item.candidate_name}
                                    {item.is_hired && <span className="text-amber-600 text-[9px] font-black font-mono uppercase">HIRED</span>}
                                  </span>
                                </td>
                                <td className="p-4 font-medium">{item.round_category}</td>
                                <td className="p-4 font-mono text-slate-450">{item.date_time}</td>
                                <td className="p-4 font-semibold">{item.lead_interviewer}</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${badstyle}`}>
                                    {item.schedule_state}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: HIRING FUNNEL REPORTS (Screen 23) */}
            {tab === 'reports' && (
              <motion.div 
                key="hiring-reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Hiring Reports & Conversion Funnels</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Acquisition insights tracking funnel attritions and demographic channels.</p>
                </div>

                {/* KPI block counts (Screen 23 layout) */}
                {(() => {
                  const fd = getFunnelData();
                  const dynamicSources = getSourceDistribution();
                  const totalSourcesCount = dynamicSources.reduce((sum, s) => sum + s.value, 0);

                  const total = candidatesList.length;
                  const screened = candidatesList.filter(c => c.resumeScore !== null).length;
                  const interview = candidatesList.filter(c => c.status === "Shortlisted" || c.status === "Hired").length;
                  const selected = candidatesList.filter(c => c.status === "Hired").length;

                  // Stage to stage conversion & drop-off
                  const screenedConv = total > 0 ? Math.round((screened / total) * 100) : 0;
                  const screenedDrop = 100 - screenedConv;

                  const interviewConv = screened > 0 ? Math.round((interview / screened) * 100) : 0;
                  const interviewDrop = 100 - interviewConv;

                  const selectedConv = interview > 0 ? Math.round((selected / interview) * 100) : 0;
                  const selectedDrop = 100 - selectedConv;

                  const getStageCandidates = () => {
                    if (activeFunnelStage === 'Applied') return candidatesList;
                    if (activeFunnelStage === 'Screened') return candidatesList.filter(c => c.resumeScore !== null);
                    if (activeFunnelStage === 'Interview') return candidatesList.filter(c => c.status === "Shortlisted" || c.status === "Hired");
                    if (activeFunnelStage === 'Selected') return candidatesList.filter(c => c.status === "Hired");
                    if (activeFunnelStage === 'Rejected') return candidatesList.filter(c => c.status === "Rejected");
                    return candidatesList; // 'All'
                  };
                  const stageCandidates = getStageCandidates();

                  return (<>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-slate-900 dark:text-white">
                        {fd.kpi.map((rep, idx) => (
                          <div key={idx} className="p-5 bg-white dark:bg-[#14183B]/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] hover:border-[#6342E8]/40">
                            <span className="text-[10px] font-mono tracking-widest text-slate-600 dark:text-slate-400 uppercase block font-extrabold">{rep.title}</span>
                            <strong className="text-2xl font-black block mt-2 text-slate-900 dark:text-white">{rep.count}</strong>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1 font-medium">{rep.note}</span>
                          </div>
                        ))}
                      </div>

                      {/* Conversion Funnel Inverted pyramid simulation details */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Funnel chart (Span 7) */}
                        <div className="lg:col-span-7 bg-white dark:bg-[#14183B]/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl space-y-6 text-slate-900 dark:text-white flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">Conversion Funnel Stages</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Click on a stage to filter and inspect candidate profiles below.</p>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                            {/* Stage 1: Applied */}
                            <div 
                              onClick={() => setActiveFunnelStage('Applied')}
                              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                activeFunnelStage === 'Applied' 
                                  ? 'bg-[#6342E8]/20 border-[#6342E8] shadow-lg dark:shadow-purple-500/10' 
                                  : 'bg-white dark:bg-[#14183B]/[0.02] border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/[0.05] hover:border-white/15'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#6342E8]"></span>
                                  1. Applied Applications
                                </span>
                                <span className="font-mono bg-white dark:bg-[#14183B]/10 px-2 py-0.5 rounded-md font-bold">{total} candidates (100%)</span>
                              </div>
                              <div className="w-full bg-white dark:bg-[#14183B]/5 h-2 rounded-full mt-2.5 overflow-hidden">
                                <div className="bg-[#6342E8] h-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>

                            {/* Drop-off 1 */}
                            <div className="flex justify-center items-center gap-2 text-[10px] font-semibold">
                              <span className="text-purple-400">↓ {screenedConv}% Conversion</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-rose-400">↓ {screenedDrop}% Drop-off</span>
                            </div>

                            {/* Stage 2: Screened */}
                            <div 
                              onClick={() => setActiveFunnelStage('Screened')}
                              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                activeFunnelStage === 'Screened' 
                                  ? 'bg-[#818cf8]/20 border-[#818cf8] shadow-lg shadow-blue-500/10' 
                                  : 'bg-white dark:bg-[#14183B]/[0.02] border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/[0.05] hover:border-white/15'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]"></span>
                                  2. Screened Resume Passes
                                </span>
                                <span className="font-mono bg-white dark:bg-[#14183B]/10 px-2 py-0.5 rounded-md font-bold">{screened} candidates ({total > 0 ? Math.round((screened / total) * 100) : 0}%)</span>
                              </div>
                              <div className="w-full bg-white dark:bg-[#14183B]/5 h-2 rounded-full mt-2.5 overflow-hidden">
                                <div className="bg-[#818cf8] h-full" style={{ width: `${total > 0 ? (screened / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>

                            {/* Drop-off 2 */}
                            <div className="flex justify-center items-center gap-2 text-[10px] font-semibold">
                              <span className="text-pink-400">↓ {interviewConv}% Conversion</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-rose-400">↓ {interviewDrop}% Drop-off</span>
                            </div>

                            {/* Stage 3: Interview */}
                            <div 
                              onClick={() => setActiveFunnelStage('Interview')}
                              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                activeFunnelStage === 'Interview' 
                                  ? 'bg-pink-500/20 border-pink-500 shadow-lg shadow-pink-500/10' 
                                  : 'bg-white dark:bg-[#14183B]/[0.02] border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/[0.05] hover:border-white/15'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                                  3. Administered Interview rounds
                                </span>
                                <span className="font-mono bg-white dark:bg-[#14183B]/10 px-2 py-0.5 rounded-md font-bold">{interview} candidates ({total > 0 ? Math.round((interview / total) * 100) : 0}%)</span>
                              </div>
                              <div className="w-full bg-white dark:bg-[#14183B]/5 h-2 rounded-full mt-2.5 overflow-hidden">
                                <div className="bg-pink-500 h-full" style={{ width: `${total > 0 ? (interview / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>

                            {/* Drop-off 3 */}
                            <div className="flex justify-center items-center gap-2 text-[10px] font-semibold">
                              <span className="text-emerald-400">↓ {selectedConv}% Conversion</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-rose-400">↓ {selectedDrop}% Drop-off</span>
                            </div>

                            {/* Stage 4: Selected */}
                            <div 
                              onClick={() => setActiveFunnelStage('Selected')}
                              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                activeFunnelStage === 'Selected' 
                                  ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                  : 'bg-white dark:bg-[#14183B]/[0.02] border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/[0.05] hover:border-white/15'
                              }`}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                  4. Selected & Offered Contracts
                                </span>
                                <span className="font-mono bg-white dark:bg-[#14183B]/10 px-2 py-0.5 rounded-md font-bold">{selected} candidates ({total > 0 ? Math.round((selected / total) * 100) : 0}%)</span>
                              </div>
                              <div className="w-full bg-white dark:bg-[#14183B]/5 h-2 rounded-full mt-2.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${total > 0 ? (selected / total) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Acquisition origin Donut distribution (Span 5) */}
                        <div className="lg:col-span-5 bg-white dark:bg-[#14183B]/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 text-slate-900 dark:text-white flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-355 text-slate-700 dark:text-slate-300 uppercase tracking-widest font-mono">Origin Acquisition Sources</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Breakdown of recruitment applications source channels.</p>
                          </div>
                          
                          <div className="h-40 w-full relative flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={dynamicSources}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={65}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {dynamicSources.map((leg, index) => (
                                    <Cell key={`cell-${index}`} fill={leg.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{totalSourcesCount}</span>
                              <span className="text-[8px] text-slate-405 text-slate-600 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold">TOTAL APPS</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            {dynamicSources.map((src, i) => (
                              <div key={i} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                <div className="flex gap-2 items-center">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }}></span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{src.name}</span>
                                </div>
                                <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">{src.value} Applications</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Channel Efficiency scorecard grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-slate-900 dark:text-white select-none">
                        {dynamicSources.map((src, idx) => {
                          const sourceCandidates = candidatesList.filter((_, cIdx) => {
                            if (src.name === "LinkedIn") return cIdx % 4 === 0;
                            if (src.name === "Company Website") return cIdx % 4 === 1;
                            if (src.name === "Employee Referral") return cIdx % 4 === 2;
                            return cIdx % 4 === 3;
                          });
                          const count = sourceCandidates.length;
                          const hiredCount = sourceCandidates.filter(c => c.status === "Shortlisted" && c.resumeScore && c.resumeScore >= 90).length;
                          const hireRate = count > 0 ? Math.round((hiredCount / count) * 100) : 0;
                          const avgScore = count > 0 ? Math.round(sourceCandidates.reduce((sum, c) => sum + (c.resumeScore || 0), 0) / count) : 0;

                          return (
                            <div key={idx} className="p-4 bg-white dark:bg-[#14183B]/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-2 hover:border-[#6342E8]/40 transition-all">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-350 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color }}></span>
                                  {src.name}
                                </span>
                                <span className="text-[9px] bg-purple-900/40 text-purple-300 font-bold px-2 py-0.5 rounded-full font-mono">
                                  {Math.round((count / (candidatesList.length || 1)) * 100)}% Vol
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Hire Rate</span>
                                  <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{hireRate}%</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Avg ATS Match</span>
                                  <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{avgScore || 0}%</strong>
                                </div>
                              </div></div>);
                        })}
                      </div>

                      {/* Candidate Stage Drill-Down List */}
                      <div className="bg-white dark:bg-[#14183B]/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl space-y-4 text-slate-900 dark:text-white">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest font-mono flex items-center gap-2">
                              <span>Candidates Drill-Down ({activeFunnelStage} Stage)</span>
                              <span className="text-[10px] bg-[#6342E8]/20 border border-[#6342E8]/40 text-purple-300 rounded-full px-2.5 py-0.5 tracking-wider font-mono">
                                {stageCandidates.length} Found
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Showing candidate records currently corresponding to the selected conversion tier.</p>
                          </div>
                          
                          {activeFunnelStage !== 'All' && (
                            <button 
                              onClick={() => setActiveFunnelStage('All')}
                              className="text-xs text-purple-400 hover:text-purple-300 font-bold border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Reset Filter to Show All
                            </button>
                          )}
                        </div>

                        <div className="overflow-x-auto border border-slate-100 dark:border-white/5 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-white dark:bg-[#14183B]/[0.02] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono tracking-wider">
                                <th className="p-3.5 uppercase">Candidate</th>
                                <th className="p-3.5 uppercase">Target Track</th>
                                <th className="p-3.5 uppercase">Exp</th>
                                <th className="p-3.5 uppercase">Resume Score</th>
                                <th className="p-3.5 uppercase">Status</th>
                                <th className="p-3.5 uppercase text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-700 dark:text-slate-300">
                              {stageCandidates.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                                    No candidates in this funnel stage. Click other stages to inspect.
                                  </td>
                                </tr>
                              ) : (
                                stageCandidates.map((c) => (
                                  <tr key={c.id} className="hover:bg-white dark:hover:bg-white/10 dark:bg-transparent transition-colors cursor-pointer">
                                    <td className="p-3.5">
                                      <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                                      <span className="text-[10px] text-slate-450 block font-mono">{c.email}</span>
                                    </td>
                                    <td className="p-3.5 font-medium">{c.role}</td>
                                    <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{c.exp}</td>
                                    <td className="p-3.5">
                                      {c.resumeScore !== null ? (
                                        <span className="font-bold font-mono text-emerald-400">{c.resumeScore}/100</span>
                                      ) : (
                                        <span className="text-slate-500 italic">Not evaluated</span>
                                      )}
                                    </td>
                                    <td className="p-3.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        c.status === "Hired" ? "bg-amber-950 text-amber-400 border border-amber-500/20" :
                                        c.status === "Shortlisted" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                                        c.status === "Rejected" ? "bg-rose-950 text-rose-400 border border-rose-500/20" :
                                        "bg-purple-950 text-purple-400 border border-purple-500/20"
                                      }`}>{c.status === "Hired" ? "✓ Hired" : c.status}</span>
                                    </td>
                                    <td className="p-3.5 text-right">
                                      <button 
                                        onClick={() => {
                                          setSelectedCandidate(c.name);
                                          setTab('candidate-profile'); setIsSidebarOpen(false);
                                        }}
                                        className="text-xs text-purple-400 hover:text-purple-300 hover:underline font-bold cursor-pointer"
                                      >
                                        View Spotlight →
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* TAB: CORPORATE CONFIGURATION SETTINGS (Screen 24) */}
            {tab === 'settings' && (
              <motion.div 
                key="recruiter-settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recruiter Preferences & Company Profile</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">Configure corporate identity specifications accessible to candidate portals.</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      // Persist company profile to localStorage for student portal
                      try {
                        localStorage.setItem('cs_recruiter_company_profile', JSON.stringify({
                          name: companyName,
                          industry,
                          size: companySize,
                          website,
                          phone: companyPhone,
                          email: companyEmail,
                          address: companyAddress
                        }));
                      } catch (e) {}
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className="bg-[#6342E8] hover:bg-purple-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2 items-center font-bold">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Company preference changes successfully synced! live updates instantiated.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column editing forms (Span 8) */}
                  <div className="lg:col-span-8 bg-white dark:bg-[#14183B] border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Company Profile Details</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 px-3 text-xs w-full focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white dark:bg-[#14183B] text-slate-900 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Corporate Industry</label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold rounded-lg p-2 px-3 text-xs w-full focus:outline-[#6342E8]"
                        >
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Software Development</option>
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Finance Technology</option>
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >Healthcare Systems</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Employee Size bracket</label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold rounded-lg p-2 px-3 text-xs w-full focus:outline-[#6342E8]"
                        >
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >1001-5000</option>
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >5001-10000</option>
                          <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" >10000+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Target Website URI</label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 px-3 text-xs w-full focus:outline-[#6342E8] font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Contact Information</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Corporate Email</label>
                          <input
                            type="email"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 px-3 text-xs w-full text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Corporate Phone</label>
                          <input
                            type="text"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 px-3 text-xs w-full text-slate-900 dark:text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Corporate Headquarters Location</label>
                        <input
                          type="text"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-2 px-3 text-xs w-full text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column Layout mock profile card visual (Span 4) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#1D174F] text-white p-5 rounded-2xl relative overflow-hidden border border-purple-500/10">
                      
                      {/* Logo and brand */}
                      <div className="relative z-10 space-y-4 select-none">
                        <span className="text-[9px] font-mono tracking-widest text-sky-400 uppercase font-black block">Live Candidate View Preview</span>
                        
                        <div className="flex gap-3.5 items-center">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-300/30 flex items-center justify-center font-extrabold italic text-purple-300">
                            {companyName.substring(0, 1)}
                          </div>
                          <div>
                            <strong className="text-md font-extrabold text-white block">{companyName}</strong>
                            <span className="text-[10px] tracking-wider text-purple-300 block font-semibold">{industry}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-slate-300 leading-relaxed font-medium">
                          <p>
                            Estancia High-scale Enterprise. Master developers of premium corporate automation tool kits.
                          </p>
                          <div className="flex gap-2 items-center text-[10px] text-slate-400 font-mono">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span>Size: {companySize} Employees</span>
                          </div>
                          <div className="flex gap-2 items-center text-[10px] text-purple-300 font-mono hover:underline">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span>{website}</span>
                          </div>
                        </div>
                      </div>

                      {/* bg layout overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* EMAIL SENT TOAST NOTIFICATION */}
        <AnimatePresence>
          {emailSentToast && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-[60] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm border backdrop-blur-sm ${
                emailSentToast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                  : 'bg-[#1D174F]/95 border-purple-500/30 text-purple-200'
              }`}
            >
              <div className={`w-5 h-5 shrink-0 mt-0.5 rounded-full flex items-center justify-center text-xs font-black ${
                emailSentToast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'
              }`}>
                {emailSentToast.type === 'success' ? '✓' : 'i'}
              </div>
              <div>
                <p className="text-xs font-semibold leading-relaxed">{emailSentToast.msg}</p>
              </div>
              <button onClick={() => setEmailSentToast(null)} className="text-slate-900 dark:text-white/40 hover:text-slate-900 dark:text-white ml-2 shrink-0 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMAIL CONFIGURATION MODAL */}
        <AnimatePresence>
          {showEmailModal && emailModalCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#1D174F] border border-purple-500/30 text-slate-900 dark:text-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h4 className="text-md font-black tracking-tight text-purple-300">Customize Recruiter Communication</h4>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">Candidate: {emailModalCandidate.name} ({emailModalCandidate.email})</span>
                  </div>
                  <button 
                    onClick={() => { setShowEmailModal(false); setEmailModalCandidate(null); }}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1 font-mono">To</label>
                    <input 
                      type="text" 
                      disabled 
                      value={emailModalCandidate.email}
                      className="bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 w-full text-slate-700 dark:text-slate-300 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1 font-mono">Subject</label>
                    <input 
                      type="text" 
                      value={emailModalSubject}
                      onChange={(e) => setEmailModalSubject(e.target.value)}
                      className="bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 w-full text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1 font-mono">Message Body</label>
                    <textarea 
                      rows={6}
                      value={emailModalBody}
                      onChange={(e) => setEmailModalBody(e.target.value)}
                      className="bg-white dark:bg-[#14183B]/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 w-full text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  {emailModalActionType === 'Hire' ? (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleSendEmailFromModal('Hired')}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95 ring-2 ring-amber-300/40"
                      >
                        🎉 Confirm Hire & Dispatch Offer Letter
                      </button>
                      <button
                        onClick={() => { setShowEmailModal(false); setEmailModalCandidate(null); }}
                        className="bg-white dark:bg-[#14183B]/10 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/20 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => handleSendEmailFromModal('Shortlisted')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Send Invitation & Approve
                        </button>
                        <button
                          onClick={() => handleSendEmailFromModal('Rejected')}
                          className="bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Send Rejection & Reject
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSendEmailFromModal('Rejected - Invited')}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Send Invite Anyway (Keep Rejected)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* ── SCHEDULE INTERVIEW MODAL ── */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0B0E2E] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5 z-10 text-slate-900 dark:text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Schedule Interview</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">Set date & time — candidate will receive an RSVP notification</p>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/10 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Candidate Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Select Candidate</label>
                <select
                  value={scheduleForm.candidateId}
                  onChange={(e) => {
                    const cand = candidatesList.find(c => c.id === e.target.value);
                    if (cand) setScheduleForm(f => ({ ...f, candidateId: cand.id, candidateName: cand.name, candidateEmail: cand.email }));
                  }}
                  className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {candidatesList.map(c => (
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" key={c.id} value={c.id} >
                      {c.name} — {c.role} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Interview Date</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Reporting Time</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Category + Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Interview Category</label>
                  <select
                    value={scheduleForm.category}
                    onChange={(e) => setScheduleForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white dark:bg-[#14183B] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="Technical Interview" >Technical Interview</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="HR Interview" >HR Interview</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="System Design Interview" >System Design Interview</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="Managerial Interview" >Managerial Interview</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Interview Duration</label>
                  <select
                    value={scheduleForm.durationHours}
                    onChange={(e) => setScheduleForm(f => ({ ...f, durationHours: e.target.value }))}
                    className="w-full bg-white dark:bg-[#14183B] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="1 Hour" >1 Hour</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="2 Hours" >2 Hours</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="3 Hours" >3 Hours</option>
                    <option className="bg-white dark:bg-[#0B0E2E] text-slate-900 dark:text-slate-200" value="30 Minutes" >30 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Venue / Location</label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm(f => ({ ...f, venue: e.target.value }))}
                  className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Lead Interviewer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-mono block">Lead Interviewer</label>
                <input
                  type="text"
                  value={scheduleForm.interviewer}
                  onChange={(e) => setScheduleForm(f => ({ ...f, interviewer: e.target.value }))}
                  className="w-full bg-white dark:bg-[#14183B]/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Preview */}
              {scheduleForm.date && scheduleForm.time && (
                <div className="p-3.5 bg-purple-900/20 border border-purple-500/20 rounded-xl text-xs space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-bold block">Schedule Preview</span>
                  <span className="text-slate-900 dark:text-white font-bold block">
                    {scheduleForm.candidateName} — {new Date(`${scheduleForm.date}T${scheduleForm.time}`).toLocaleString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 block">{scheduleForm.venue}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleScheduleInterview}
                  disabled={!scheduleForm.date || !scheduleForm.time || schedulingInProgress}
                  className="flex-1 bg-[#6342E8] hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-lg shadow-purple-500/20"
                >
                  {schedulingInProgress ? 'Sending RSVP...' : '📅 Confirm & Send RSVP to Candidate'}
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-white dark:bg-[#14183B]/10 hover:bg-white dark:hover:bg-white/10 dark:bg-[#14183B]/15 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div></div>
  );
}

