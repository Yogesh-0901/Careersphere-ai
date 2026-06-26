import React, { useState, useEffect, useRef, useCallback } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import {
  Award, Mic, MicOff, Video, VideoOff, ChevronRight, X, RefreshCw,
  Star, Trophy, Clock, Zap, Shield, Brain, BarChart3, CheckCircle2,
  AlertTriangle, BookOpen, Target, TrendingUp, User, Download, Share2,
  Volume2, VolumeX, ChevronDown, Sparkles, Play, Pause
} from "lucide-react";
import { InterviewMetric, InterviewSession } from "../types";

/* ─────────────────────────── CONSTANTS ─────────────────────────── */

const ROLES = [
  { id: "Frontend Engineer",      label: "Frontend Engineer",      icon: "🖥️",  color: "from-blue-500 to-cyan-400" },
  { id: "Backend Developer",      label: "Backend Developer",      icon: "⚙️",  color: "from-green-500 to-emerald-400" },
  { id: "Full Stack Developer",   label: "Full Stack Developer",   icon: "⚡",  color: "from-purple-500 to-violet-400" },
  { id: "UI/UX Designer",         label: "UI/UX Designer",         icon: "🎨",  color: "from-pink-500 to-rose-400" },
  { id: "Data Analyst",           label: "Data Analyst",           icon: "📊",  color: "from-yellow-500 to-amber-400" },
  { id: "AI & ML Engineer",       label: "AI & ML Engineer",       icon: "🤖",  color: "from-indigo-500 to-blue-400" },
  { id: "Cyber Security Analyst", label: "Cyber Security",         icon: "🛡️",  color: "from-red-500 to-orange-400" },
  { id: "Cloud Engineer",         label: "Cloud Engineer",         icon: "☁️",  color: "from-sky-500 to-blue-400" },
  { id: "Digital Marketer",       label: "Digital Marketer",       icon: "📱",  color: "from-teal-500 to-cyan-400" },
  { id: "Product Manager",        label: "Product Manager",        icon: "📋",  color: "from-orange-500 to-amber-400" },
];

const CATEGORIES = [
  { id: "HR Interview",           label: "HR Interview",           icon: "👥", desc: "Behavioral & personality fit" },
  { id: "Technical Interview",    label: "Technical Interview",    icon: "💻", desc: "Core technical & domain knowledge" },
  { id: "Role-Specific Interview",label: "Role Interview",         icon: "🎯", desc: "Role-focused in-depth scenarios" },
  { id: "System Design Interview",label: "System Design",          icon: "🏗️", desc: "Architecture & scalability design" },
  { id: "Behavioral Interview",   label: "Behavioral Interview",   icon: "🧠", desc: "STAR method & leadership stories" },
];

const DIFFICULTIES = [
  { id: "Beginner",     label: "Beginner",     color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40", questions: 4, mins: "5–10" },
  { id: "Intermediate", label: "Intermediate", color: "text-yellow-400",  bg: "bg-yellow-500/20 border-yellow-500/40",  questions: 6, mins: "15–20" },
  { id: "Advanced",     label: "Advanced",     color: "text-orange-400",  bg: "bg-orange-500/20 border-orange-500/40",  questions: 8, mins: "25–30" },
  { id: "Expert",       label: "Expert",       color: "text-rose-400",    bg: "bg-rose-500/20 border-rose-500/40",      questions: 10, mins: "40–50" },
];

export let LEADERBOARD_MOCK: any[] = [];

/* ─────────────────────────── HELPERS ─────────────────────────── */

function getDifficultyInfo(id: string) {
  return DIFFICULTIES.find(d => d.id === id) || DIFFICULTIES[1];
}

function getScoreGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: "S+", color: "text-yellow-300", label: "Outstanding" };
  if (score >= 80) return { grade: "A",  color: "text-emerald-400", label: "Excellent" };
  if (score >= 70) return { grade: "B",  color: "text-blue-400",    label: "Good" };
  if (score >= 60) return { grade: "C",  color: "text-yellow-400",  label: "Average" };
  return               { grade: "D",  color: "text-rose-400",    label: "Needs Work" };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─────────────────────────── AI AVATAR ─────────────────────────── */

function AIAvatar({ speaking, thinking }: { speaking: boolean; thinking: boolean }) {
  return (<div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
      {/* Pulsing glow rings */}
      {speaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
          <div className="absolute -inset-2 rounded-full border border-purple-400/40 animate-pulse" />
        </>
      )}
      {thinking && (
        <div className="absolute -inset-3 rounded-full border-2 border-dashed border-blue-400/50 animate-spin" style={{ animationDuration: "3s" }} />
      )}
      {/* Core avatar circle */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#6342E8] via-[#8b5cf6] to-[#a78bfa] flex items-center justify-center shadow-2xl shadow-purple-500/40">
        {/* Holographic inner ring */}
        <div className="absolute inset-1 rounded-full border border-white/20" />
        <div className="absolute inset-2 rounded-full border border-slate-200 dark:border-white/10" />
        {/* AI face icon */}
        <span className="text-2xl md:text-3xl">🤖</span>
        {/* Speaking wave bars */}
        {speaking && (
          <div className="absolute -bottom-5 flex gap-[3px] items-end">
            {[4,7,5,8,3,6,9,4].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-purple-400"
                style={{
                  height: `${h * 2}px`,
                  animation: `bounce ${0.4 + i * 0.05}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.06}s`
                }}
              />
            ))}
          </div>
        )}
        {thinking && (
          <div className="absolute -bottom-5 flex gap-1 items-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
      {/* Status indicator */}
      <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-[#0B0E2E] ${speaking ? "bg-emerald-400" : thinking ? "bg-yellow-400 animate-pulse" : "bg-slate-500"}`} />
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

interface MockInterviewPortalProps {
  userName: string;
  selectedRole: string;
  userEmail?: string;
  isOfficialScheduledInterview?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

type Phase = "setup" | "active" | "evaluating" | "result" | "leaderboard" | "history";

export default function MockInterviewPortal({ userName, selectedRole, userEmail, isOfficialScheduledInterview, scheduledDate, scheduledTime }: MockInterviewPortalProps) {
  /* ── Setup state ── */
  const [phase, setPhase] = useState<Phase>("setup");
    const [timeStatus, setTimeStatus] = useState<'early' | 'ready' | 'expired'>('ready');
  const [timeMessage, setTimeMessage] = useState('');

  useEffect(() => {
    if (!isOfficialScheduledInterview || !scheduledDate || !scheduledTime) return;

    const checkTime = () => {
      try {
        const now = new Date();
        const sched = new Date(`${scheduledDate}T${scheduledTime}`);
        if (isNaN(sched.getTime())) return; // invalid date

        const diffMs = now.getTime() - sched.getTime();
        const diffMins = diffMs / (1000 * 60);

        if (diffMins < 0) {
          setTimeStatus('early');
          setTimeMessage(`Interview starts at ${scheduledTime}`);
        } else if (diffMins > 5) {
          setTimeStatus('expired');
          setTimeMessage('Session Expired');
        } else {
          setTimeStatus('ready');
          setTimeMessage('');
        }
      } catch(e) {}
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isOfficialScheduledInterview, scheduledDate, scheduledTime]);

  const [role, setRole] = useState(() => {
    // Map parent selectedRole to ROLES id
    const parentRole = selectedRole || "UI/UX Designer";
    return ROLES.find(r => r.id === parentRole)?.id || ROLES[0].id;
  });
  const [category, setCategory] = useState("HR Interview");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [sessionSeed, setSessionSeed] = useState(0);

  /* ── Active interview state ── */
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [qas, setQas] = useState<{ question: string; answer: string }[]>([]);
  const [answer, setAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  /* ── Timer ── */
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Voice / Webcam ── */
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [aiVoiceOn, setAiVoiceOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  /* ── Result ── */
  const [result, setResult] = useState<InterviewMetric | null>(null);

  /* ── History (localStorage) ── */
  const [history, setHistory] = useState<InterviewSession[]>(() => {
    try { return JSON.parse(localStorage.getItem("cs_interview_history") || "[]"); }
    catch { return []; }
  });

  const diffInfo = getDifficultyInfo(difficulty);
  const maxQuestions = diffInfo.questions;

  /* ── Sync role with parent ── */
  useEffect(() => {
    const parentRole = selectedRole || "UI/UX Designer";
    const matched = ROLES.find(r => r.id === parentRole);
    if (matched) setRole(matched.id);
    if (isOfficialScheduledInterview) {
      setCategory("Technical Interview");
      setDifficulty("Intermediate");
    }
  }, [selectedRole, isOfficialScheduledInterview]);

  /* ── Timer ── */
  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  /* ── Webcam ── */
  const startCam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch { setCamOn(false); }
  }, []);

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  }, []);

  useEffect(() => { return () => stopCam(); }, [stopCam]);

  /* ── Speech Recognition ── */
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setAnswer(prev => prev + (prev ? " " : "") + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /* ── TTS ── */
  const speak = useCallback((text: string) => {
    if (!aiVoiceOn) return;
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.05;
    utter.onstart = () => setAiSpeaking(true);
    utter.onend = () => setAiSpeaking(false);
    window.speechSynthesis?.speak(utter);
  }, [aiVoiceOn]);

  /* ── Fetch next question ── */
  const fetchQuestion = useCallback(async (updatedQas: { question: string; answer: string }[], seed: number) => {
    setAiThinking(true);
    setQuestionLoading(true);
    try {
      const askedQuestions = updatedQas.map(qa => qa.question);
      const res = await fetch("/api/ai/generate-next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty, category, QAs: updatedQas, userName, sessionSeed: seed, askedQuestions })
      });
      const data = await res.json();
      const q = data.question || "Could you elaborate further on your previous answer?";
      setCurrentQuestion(q);
      setAiThinking(false);
      setAiSpeaking(true);
      speak(q);
      setTimeout(() => setAiSpeaking(false), Math.max(2000, q.length * 60));
    } catch {
      const fallback = "Tell me about your greatest challenge and how you overcame it.";
      setCurrentQuestion(fallback);
      setAiThinking(false);
      speak(fallback);
    } finally {
      setQuestionLoading(false);
    }
  }, [role, difficulty, category, userName, speak]);

  /* ── Start Interview ── */
  const startInterview = async () => {
    const newSeed = Math.floor(Math.random() * 997) + 1; // random 1–997
    setSessionSeed(newSeed);
    setPhase("active");
    setQas([]);
    setAnswer("");
    setResult(null);
    setElapsedSeconds(0);
    await fetchQuestion([], newSeed);
  };

  /* ── Submit Answer ── */
  const submitAnswer = async () => {
    if (!answer.trim() || questionLoading) return;
    stopListening();
    const updatedQas = [...qas, { question: currentQuestion, answer }];
    setQas(updatedQas);
    setAnswer("");

    if (updatedQas.length >= maxQuestions) {
      // Evaluate
      setPhase("evaluating");
      window.speechSynthesis?.cancel();
      let sessionScore = 82;
      try {
        const res = await fetch("/api/ai/interview-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, difficulty, category, QAs: updatedQas })
        });
        const data = await res.json();
        setResult(data);

        // Save to history
        const session: InterviewSession = {
          id: Date.now().toString(),
          role,
          category,
          difficulty,
          score: data.overall,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          duration: Math.ceil(elapsedSeconds / 60)
        };
        sessionScore = data.overall;
        const updated = [session, ...history].slice(0, 10);
        setHistory(updated);
        try { await setDoc(doc(db, "interviews", userEmail.toLowerCase()), { history: updated }, { merge: true }); } catch(e){}

        // Save to candidate's own record in cs_registered_candidates
        try {
          const storedCands = localStorage.getItem("cs_registered_candidates") || "[]";
          const cands = JSON.parse(storedCands);
          const updatedCands = cands.map((c: any) => {
            const matchEmail = userEmail && c.email.toLowerCase() === userEmail.toLowerCase();
            const matchName = c.name.toLowerCase() === userName.toLowerCase();
            if (matchEmail || (!userEmail && matchName)) {
              const prevInterviews = c.interviewsTaken || [];
              const updatedRecord = {
                ...c,
                interviewsTaken: [session, ...prevInterviews].slice(0, 10)
              } as any;
              if (isOfficialScheduledInterview) {
                updatedRecord.interviewRSVP = 'completed';
                updatedRecord.officialInterviewResult = {
                  score: data.overall,
                  feedback: data.feedback || [],
                  qas: updatedQas,
                  date: new Date().toLocaleDateString("en-IN"),
                  status: 'Completed',
                  approvedOrRejected: 'Pending'
                };
                updatedRecord.status = 'In Review';
              }
              return updatedRecord;
            }
            return c;
          });
          localStorage.setItem("cs_registered_candidates", JSON.stringify(updatedCands));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("Failed to save interview session to candidate record:", e);
        }
      } catch {
        // Dynamic scoring based on answers
        let score = 0;
        let totalWords = 0;
        
        updatedQas.forEach(qa => {
          const ans = qa.answer.trim().toLowerCase();
          const words = ans.split(/\\s+/).length;
          totalWords += words;
          
          if (ans.length > 10 && (ans.includes("because") || ans.includes("using") || ans.includes("system") || ans.includes("react") || ans.includes("data") || ans.includes("design") || ans.includes("experience") || ans.includes("developed") || ans.includes("example") || ans.includes("for instance") || ans.includes("achieved") || ans.includes("optimized") || ans.includes("implemented") || ans.includes("created"))) {
            score += 20;
          } else if (ans.length > 5) {
            score += 10;
          }
        });
        
        let finalScore = Math.min(95, Math.max(15, Math.floor((score / (updatedQas.length * 20)) * 100)));
        if (totalWords < 5) finalScore = 15; // "below 20" for very poor/wrong answers
        
        const mockResult = {
          communication: Math.min(100, finalScore + 5), 
          confidence: Math.min(100, finalScore + 2), 
          technical: finalScore, 
          problemSolving: Math.min(100, finalScore + 4),
          professionalism: Math.min(100, finalScore + 8), 
          overall: finalScore,
          feedback: finalScore > 50 ? ["Good structured responses.", "Demonstrated clear technical awareness."] : ["Answers were too brief or lacked technical depth.", "Need to elaborate more on your thought process."],
          weaknesses: finalScore > 50 ? ["Could improve on quantitative examples."] : ["Communication was not clear.", "Lacked confidence in technical answers."],
          suggestions: finalScore > 50 ? ["Practice STAR method for behavioral answers."] : ["Study core concepts and practice explaining them aloud.", "Provide detailed examples from past experiences."],
          resources: ["Interview Prep Guide", "System Design Primer"]
        };
        setResult(mockResult);

        const session: InterviewSession = {
          id: Date.now().toString(),
          role,
          category,
          difficulty,
          score: mockResult.overall,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          duration: Math.ceil(elapsedSeconds / 60)
        };
        sessionScore = mockResult.overall;
        const updated = [session, ...history].slice(0, 10);
        setHistory(updated);
        try { await setDoc(doc(db, "interviews", userEmail.toLowerCase()), { history: updated }, { merge: true }); } catch(e){}

        // Save to candidate's own record in cs_registered_candidates
        try {
          const storedCands = localStorage.getItem("cs_registered_candidates") || "[]";
          const cands = JSON.parse(storedCands);
          const updatedCands = cands.map((c: any) => {
            const matchEmail = userEmail && c.email.toLowerCase() === userEmail.toLowerCase();
            const matchName = c.name.toLowerCase() === userName.toLowerCase();
            if (matchEmail || (!userEmail && matchName)) {
              const prevInterviews = c.interviewsTaken || [];
              const updatedRecord = {
                ...c,
                interviewsTaken: [session, ...prevInterviews].slice(0, 10)
              } as any;
              if (isOfficialScheduledInterview) {
                updatedRecord.interviewRSVP = 'completed';
                updatedRecord.officialInterviewResult = {
                  score: mockResult.overall,
                  feedback: mockResult.feedback,
                  qas: updatedQas,
                  date: new Date().toLocaleDateString("en-IN"),
                  status: 'Completed',
                  approvedOrRejected: 'Pending'
                };
                updatedRecord.status = 'In Review';
              }
              return updatedRecord;
            }
            return c;
          });
          localStorage.setItem("cs_registered_candidates", JSON.stringify(updatedCands));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("Failed to save interview session to candidate record:", e);
        }
      } finally {
        LEADERBOARD_MOCK.push({ name: userName, score: sessionScore, badge: "🎖️" });
        LEADERBOARD_MOCK.sort((a,b)=>b.score-a.score);
        setPhase("result");
      }
    } else {
      await fetchQuestion(updatedQas, sessionSeed);
    }
  };

  /* ── Quit interview ── */
  const quitInterview = () => {
    window.speechSynthesis?.cancel();
    stopListening();
    stopCam();
    setPhase("setup");
    setQas([]);
    setAnswer("");
    setCurrentQuestion("");
    setElapsedSeconds(0);
  };

  const scoreInfo = result ? getScoreGrade(result.overall) : null;
  const progress = qas.length / maxQuestions;

  /* ═══════════════════════════════════════════════════════════════ */
  /*  RENDER                                                          */
  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-400" />
            AI Mock Interview Portal
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Adaptive AI interviewer · Role-specific · Real evaluation with 5-metric scoring
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPhase("leaderboard")}
            className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <Trophy className="w-3.5 h-3.5" /> Leaderboard
          </button>
          {history.length > 0 && (
            <button
              onClick={() => setPhase("history")}
              className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" /> History
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════ SETUP PHASE ══════════════ */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {isOfficialScheduledInterview ? (
                <div className="lg:col-span-8 bg-gradient-to-r from-purple-100 dark:from-purple-900/40 to-blue-100 dark:to-blue-900/40 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 border border-purple-400/30 rounded-xl flex items-center justify-center text-xl">
                        🎯
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-purple-400 font-bold uppercase block">Official Evaluation Mode</span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Scheduled Interview for {role}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      This is your official interview scheduled by the recruiter. Your audio, responses, and metrics will be evaluated by our AI engine and submitted directly to the recruiter's portal.
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] font-mono">Job Track</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{role}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] font-mono">Evaluation Round</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{category}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] font-mono">Difficulty Level</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{difficulty}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase text-[10px] font-mono">Questions</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{diffInfo.questions} Questions</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    id="btn-start-interview"
                    onClick={startInterview}
                    disabled={timeStatus !== 'ready'}
                    className={`w-full text-white font-extrabold py-3.5 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                      timeStatus === 'ready' 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 cursor-pointer active:scale-95' 
                        : timeStatus === 'expired'
                        ? 'bg-red-500/50 cursor-not-allowed opacity-75 border border-red-500/30'
                        : 'bg-slate-500/50 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {timeStatus === 'ready' && <><Play className="w-4 h-4" /> Start Official Scheduled Interview</>}
                    {timeStatus === 'early' && <><span className="text-lg">⏳</span> {timeMessage}</>}
                    {timeStatus === 'expired' && <><span className="text-lg">🚫</span> {timeMessage} (Missed 5-minute window)</>}
                  </button>
                </div>
              ) : (
                /* Left column: Role + Category + Difficulty */
                <div className="lg:col-span-8 space-y-5">

                  {/* Role selector */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-purple-400" /> Select Your Role
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ROLES.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRole(r.id)}
                          className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer overflow-hidden group ${
                            role === r.id
                              ? "border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                              : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-white/20 hover:bg-slate-50 dark:bg-white/5"
                          }`}
                        >
                          {role === r.id && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-5`} />
                          )}
                          <div className="text-xl mb-1">{r.icon}</div>
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{r.label}</div>
                          {role === r.id && (
                            <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-purple-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category selector */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-purple-400" /> Interview Category
                    </span>
                    <div className="space-y-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCategory(c.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            category === c.id
                              ? "border-purple-500/60 bg-purple-500/10"
                              : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <span className="text-lg shrink-0">{c.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{c.label}</div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-400">{c.desc}</div>
                          </div>
                          {category === c.id && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty selector */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400" /> Difficulty Level
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d.id}
                          onClick={() => setDifficulty(d.id)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            difficulty === d.id ? d.bg : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <div className={`text-xs font-black ${difficulty === d.id ? d.color : "text-slate-600 dark:text-slate-400"}`}>{d.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{d.questions}Q · {d.mins}m</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start button */}
                  <button
                    id="btn-start-interview"
                    onClick={startInterview}
                    className="w-full bg-gradient-to-r from-[#6342E8] to-purple-500 hover:from-purple-600 hover:to-purple-500 text-white font-extrabold py-4 rounded-xl text-sm shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-5 h-5" />
                    Start AI Interview — {role}
                  </button>
                </div>
              )}

              {/* Right: info panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">Session Preview</span>
                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{role}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-bold text-slate-900 dark:text-white">{CATEGORIES.find(c=>c.id===category)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Difficulty</span><span className={`font-bold ${getDifficultyInfo(difficulty).color}`}>{difficulty}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Questions</span><span className="font-bold text-slate-900 dark:text-white">{diffInfo.questions}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-bold text-slate-900 dark:text-white">{diffInfo.mins} min</span></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════ ACTIVE INTERVIEW PHASE ══════════════ */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Top bar */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {/* Progress pills */}
                <div className="flex gap-1">
                  {Array.from({ length: maxQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i < qas.length ? "bg-purple-400 w-4" : i === qas.length ? "bg-purple-400/50 w-3 animate-pulse" : "bg-white/10 w-3"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Q{qas.length + 1}/{maxQuestions}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Timer */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1">
                  <Clock className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                  <span className="font-mono text-xs text-slate-900 dark:text-white">{formatDuration(elapsedSeconds)}</span>
                </div>
                {/* Controls */}
                <button
                  onClick={() => { setMicOn(m => !m); micOn ? stopListening() : null; }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${micOn ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}
                >
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => camOn ? stopCam() : startCam()}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${camOn ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}
                >
                  {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setAiVoiceOn(v => !v); if (aiVoiceOn) window.speechSynthesis?.cancel(); }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${aiVoiceOn ? "bg-green-500/20 border-green-500/40 text-green-300" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}
                >
                  {aiVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={quitInterview}
                  className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main interview area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Left: AI Interviewer + webcam */}
              <div className="lg:col-span-4 space-y-4">

                {/* AI Avatar panel */}
                <div className="bg-gradient-to-b from-slate-100 dark:from-[#1a1040] to-slate-200 dark:to-[#0B0E2E] border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">AI Interviewer</div>
                  <AIAvatar speaking={aiSpeaking} thinking={aiThinking} />
                  <div className="text-center space-y-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">CareerSphere AI</div>
                    <div className="text-[10px] text-slate-500">{category} · {difficulty}</div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      aiSpeaking ? "bg-emerald-500/20 text-emerald-400" : aiThinking ? "bg-yellow-500/20 text-yellow-400 animate-pulse" : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${aiSpeaking ? "bg-emerald-400 animate-ping" : aiThinking ? "bg-yellow-400" : "bg-slate-400"}`} />
                      {aiSpeaking ? "Speaking..." : aiThinking ? "Thinking..." : "Waiting"}
                    </div>
                  </div>
                </div>

                {/* Webcam preview */}
                {camOn && (
                  <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 text-slate-900 dark:text-white text-[10px] font-bold">{userName}</div>
                  </div>
                )}
                {!camOn && (
                  <button onClick={startCam} className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 border-dashed rounded-2xl py-6 text-slate-500 text-xs transition-all cursor-pointer">
                    <Video className="w-4 h-4" /> Enable Camera
                  </button>
                )}

                {/* Previous Q answers */}
                {qas.length > 0 && (
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-2 max-h-52 overflow-y-auto">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Answered ({qas.length})</span>
                    {qas.map((qa, i) => (
                      <div key={i} className="text-[10px] border border-white/5 rounded-lg p-2 bg-slate-50 dark:bg-white/[0.02]">
                        <div className="text-purple-400 font-bold mb-0.5">Q{i+1}: {qa.question.slice(0,60)}...</div>
                        <div className="text-slate-500 line-clamp-2">{qa.answer.slice(0,80)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Question + Answer */}
              <div className="lg:col-span-8 space-y-4">

                {/* Question display */}
                <div className="bg-gradient-to-br from-[#6342E8]/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-6 min-h-[120px] flex flex-col justify-between shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-purple-300">AI</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Interviewer Question</span>
                  </div>

                  {questionLoading ? (
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">Generating question...</span>
                    </div>
                  ) : (
                    <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                      "{currentQuestion}"
                    </p>
                  )}
                </div>

                {/* Answer area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest">Your Answer</span>
                    <span className="text-[10px] text-slate-500">{answer.length} chars</span>
                  </div>
                  <textarea
                    rows={6}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your answer here, or click the mic button to use voice dictation..."
                    className="w-full bg-white/[0.03] border border-slate-200 dark:border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-all font-medium leading-relaxed"
                  />
                  <div className="flex gap-3">
                    {micOn && (
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isListening
                            ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse"
                            : "bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        {isListening ? "Stop Dictation" : "Start Dictation"}
                      </button>
                    )}
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim() || questionLoading}
                      className="flex-1 bg-gradient-to-r from-[#6342E8] to-purple-500 hover:from-purple-600 hover:to-violet-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {qas.length + 1 >= maxQuestions ? "Submit Interview" : "Next Question"}
                    </button>
                  </div>
                </div>

                {/* Tips strip */}
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span className="text-[10px] text-slate-500">
                    Tip: Structure your answers using the <strong className="text-slate-600 dark:text-slate-400">STAR method</strong> — Situation, Task, Action, Result — for behavioral questions.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════ EVALUATING ══════════════ */}
        {phase === "evaluating" && (
          <motion.div key="eval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-purple-400/40 animate-spin" style={{ animationDuration: "4s" }} />
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6342E8] to-purple-400 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Brain className="w-12 h-12 text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white animate-pulse">Evaluating Your Performance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                AI is analyzing your {qas.length} answers across communication, technical depth, confidence, and problem-solving...
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {["Communication", "Technical", "Confidence", "Problem Solving", "Professionalism"].map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-1 h-8 bg-purple-500/20 rounded-full overflow-hidden">
                    <div className="w-full bg-purple-400 rounded-full animate-pulse" style={{ height: `${40 + i * 10}%`, animationDelay: `${i * 0.2}s` }} />
                  </div>
                  <span className="text-[8px] text-slate-600 hidden md:block">{m.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════ RESULT PHASE ══════════════ */}
        {phase === "result" && result && scoreInfo && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Score hero */}
            <div className="relative bg-gradient-to-br from-[#0B0E2E] via-[#1a1040] to-[#0B0E2E] border border-purple-500/20 rounded-3xl p-8 overflow-hidden shadow-2xl">
              {/* Decorative rings */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-blue-500/5 translate-y-1/2 -translate-x-1/2" />

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                {/* Grade circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.overall / 100)}`}
                        style={{ transition: "stroke-dashoffset 1.5s ease" }}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6342E8" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-black ${scoreInfo.color}`}>{scoreInfo.grade}</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{result.overall}%</span>
                    </div>
                  </div>
                  <span className={`mt-2 text-sm font-black ${scoreInfo.color}`}>{scoreInfo.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Overall Score</span>
                </div>

                {/* 5 metric bars */}
                <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                  {[
                    { label: "Communication",   val: result.communication,   color: "from-blue-500 to-cyan-400" },
                    { label: "Confidence",       val: result.confidence,       color: "from-purple-500 to-violet-400" },
                    { label: "Technical Depth",  val: result.technical,        color: "from-indigo-500 to-blue-400" },
                    { label: "Problem Solving",  val: result.problemSolving,   color: "from-green-500 to-emerald-400" },
                    { label: "Professionalism",  val: result.professionalism,  color: "from-yellow-500 to-amber-400" },
                  ].map((m, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{m.label}</span>
                        <span className="font-black text-slate-900 dark:text-white">{m.val}%</span>
                      </div>
                      <div className="h-2 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.val}%` }}
                          transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Session meta */}
                <div className="flex flex-col gap-3 text-center md:text-right shrink-0">
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-1">
                    <div className="text-[10px] text-slate-500">Duration</div>
                    <div className="font-bold text-slate-900 dark:text-white font-mono">{formatDuration(elapsedSeconds)}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-1">
                    <div className="text-[10px] text-slate-500">Questions</div>
                    <div className="font-bold text-slate-900 dark:text-white">{qas.length}/{maxQuestions}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-1">
                    <div className="text-[10px] text-slate-500">Difficulty</div>
                    <div className={`font-bold ${getDifficultyInfo(difficulty).color}`}>{difficulty}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-column breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Strengths */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Strengths</span>
                </div>
                {result.feedback.map((f, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-400 font-bold shrink-0">+</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Weaknesses */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Areas to Improve</span>
                </div>
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-rose-400 font-bold shrink-0">!</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">Suggestions</span>
                </div>
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-blue-400 font-bold shrink-0">{i+1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources + Certificate strip */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold">Recommended Study Resources</span>
                </div>
                {result.resources.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Star className="w-3 h-3 text-yellow-400 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Certificate preview */}
              <div className="md:col-span-5 bg-gradient-to-br from-slate-100 dark:from-[#1a1040] to-slate-200 dark:to-[#0B0E2E] border border-purple-200 dark:border-purple-500/30 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                <Award className="w-10 h-10 text-yellow-400" />
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Certificate of Completion</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {role} Mock Interview<br/>Score: {result.overall}% · {difficulty}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button className="flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer">
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button className="flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">Full Transcript</span>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {qas.map((qa, i) => (
                  <div key={i} className="space-y-1.5 border-b border-white/5 pb-3">
                    <div className="flex gap-2 text-xs">
                      <span className="text-purple-400 font-bold shrink-0">Q{i+1}:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{qa.question}</span>
                    </div>
                    <div className="flex gap-2 text-xs ml-5">
                      <span className="text-emerald-400 font-bold shrink-0">A:</span>
                      <span className="text-slate-500">{qa.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                id="btn-retry-interview"
                onClick={startInterview}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6342E8] to-purple-500 hover:from-purple-600 hover:to-violet-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Practice Again
              </button>
              <button
                onClick={() => setPhase("leaderboard")}
                className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold px-5 py-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> View Leaderboard
              </button>
              <button
                onClick={() => setPhase("setup")}
                className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold px-5 py-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" /> Change Setup
              </button>
            </div>
          </motion.div>
        )}

        {/* ══════════════ LEADERBOARD ══════════════ */}
        {phase === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Top Performers
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">CareerSphere AI Interview Leaderboard</p>
              </div>
              <button onClick={() => setPhase("setup")} className="bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                ← Back
              </button>
            </div>

            
            {LEADERBOARD_MOCK.length >= 3 ? (
              <div className="flex gap-3 items-end justify-center py-4">
                {[LEADERBOARD_MOCK[1], LEADERBOARD_MOCK[0], LEADERBOARD_MOCK[2]].map((p, i) => {
                  const heights = ["h-24", "h-32", "h-20"];
                  const rank = [2, 1, 3];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="text-2xl">{p.badge}</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white text-center">{p.name.split(" ")[0]}</div>
                      <div className={`${heights[i]} w-20 bg-gradient-to-t ${i===1 ? "from-yellow-600 to-yellow-400" : i===0 ? "from-slate-600 to-slate-400" : "from-amber-700 to-amber-500"} rounded-t-xl flex flex-col items-center justify-end pb-2`}>
                        <span className="text-slate-900 dark:text-white font-black text-sm">#{rank[i]}</span>
                        <span className="text-slate-900 dark:text-white/80 text-[10px] font-bold">{p.score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-600 dark:text-slate-400">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm">Not enough data to generate podium.</p>
                <p className="text-xs">Attend the mock interview to get ranked!</p>
              </div>
            )}
{/* Full list */}
            <div className="space-y-2">
              {LEADERBOARD_MOCK.map((p, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${i === 0 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10"}`}>
                  <span className="text-2xl w-8 shrink-0">{p.badge}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6342E8] to-purple-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{p.score}%</div>
                    <div className="text-[10px] text-slate-500">Score</div>
                  </div>
                </div>
              ))}

              {/* User's best score */}
              {history.length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-500/10">
                  <span className="text-2xl w-8 shrink-0">🎯</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-400 flex items-center justify-center text-white font-black text-sm shrink-0 ring-2 ring-purple-400">
                    {(userName || "Y")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{userName} (You)</div>
                    <div className="text-[10px] text-slate-500">Best: {Math.max(...history.map(h => h.score))}% · {history.length} sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-purple-300">{Math.max(...history.map(h => h.score))}%</div>
                    <div className="text-[10px] text-slate-500">Best Score</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setPhase("setup")}
              className="w-full bg-gradient-to-r from-[#6342E8] to-purple-500 text-white font-extrabold py-3 rounded-xl text-sm cursor-pointer"
            >
              Start New Interview
            </button>
          </motion.div>
        )}

        {/* ══════════════ HISTORY ══════════════ */}
        {phase === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Interview History
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Your past mock interview sessions</p>
              </div>
              <button onClick={() => setPhase("setup")} className="bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                ← Back
              </button>
            </div>

            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center p-8 text-slate-600 dark:text-slate-400 text-sm">No history yet. Start your first interview!</div>
              ) : (
                history.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{s.role}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{s.category} • {s.difficulty}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{s.date} • {s.duration} min</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-purple-300">{s.score}%</div>
                      <div className="text-[10px] text-slate-500">Score</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* CSS bounce keyframes */}
      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
