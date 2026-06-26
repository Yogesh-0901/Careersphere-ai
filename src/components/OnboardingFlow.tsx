import { useState, useEffect } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { 
  Globe, BarChart3, Code, Lightbulb, Shield, Cloud, Megaphone, LayoutGrid, 
  Settings, Check, Star, RefreshCw, Briefcase, GraduationCap, Flame, ArrowRight,
  Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingFlowProps {
  onComplete: (onboardingData: { 
    interests: string[]; 
    skills: string[]; 
    goal: string;
    recommendedRole: string;
    generatedRoadmap: any;
  }) => void;
  onBack: () => void;
}

export default function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  // Steps: 0 = Interests, 1 = Skills, 2 = Goals, 3 = AI Analyzing, 4 = Recommendation
  const [step, setStep] = useState(0);

  // Screen 5 Selections
  const [interests, setInterests] = useState<string[]>([]);
  // Screen 6 Selections
  const [skills, setSkills] = useState<string[]>(["HTML", "JavaScript", "Python"]);
  // Screen 7 Selections
  const [goal, setGoal] = useState("Get a Full-Time Job");

  // Screen 8 simulation progress
  const [checkProgress, setCheckProgress] = useState(0);

  // AI-connected states
  const [recommendedRole, setRecommendedRole] = useState("UI/UX Designer");
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  const [loadingRoadmapError, setLoadingRoadmapError] = useState<string | null>(null);

  // Map interests to recommended role
  const determineRecommendedRole = () => {
    if (interests.includes("Full Stack Developer")) return "Full Stack Developer";
    if (interests.includes("Frontend Engineer")) return "Frontend Engineer";
    if (interests.includes("AI & ML Engineer")) return "AI & ML Engineer";
    if (interests.includes("UI/UX Designer")) return "UI/UX Designer";
    if (interests.includes("Data Analyst")) return "Data Analyst";
    if (interests.includes("Cyber Security Analyst")) return "Cyber Security Analyst";
    if (interests.includes("Cloud Engineer")) return "Cloud Engineer";
    if (interests.includes("Digital Marketer")) return "Digital Marketer";
    if (interests.includes("Product Manager")) return "Product Manager";
    return interests[0] || "UI/UX Designer"; // fallback
  };

  const getOtherMatchesForRole = (role: string) => {
    switch (role) {
      case "Full Stack Developer":
      case "Frontend Engineer":
      case "Backend Developer":
        return [
          { role: "Frontend Engineer", score: "94%", sub: "Interface delivery", icon: Code },
          { role: "Backend Developer", score: "90%", sub: "API and DB scalability", icon: Settings },
          { role: "Cloud Engineer", score: "85%", sub: "DevOps infrastructure", icon: Cloud }
        ];
      case "AI & ML Engineer":
        return [
          { role: "Data Scientist", score: "93%", sub: "Predictive modeling", icon: Lightbulb },
          { role: "Data Analyst", score: "87%", sub: "Quantitative telemetry", icon: BarChart3 },
          { role: "Cloud Engineer", score: "82%", sub: "Distributed computing", icon: Cloud }
        ];
      case "UI/UX Designer":
      default:
        return [
          { role: "Product Designer", score: "92%", sub: "Enterprise strategy", icon: GraduationCap },
          { role: "UX Researcher", score: "88%", sub: "Interface telemetry", icon: Shield },
          { role: "Data Analyst", score: "85%", sub: "Quantitative metrics", icon: BarChart3 }
        ];
    }
  };

  useEffect(() => {
    if (step === 3) {
      const role = determineRecommendedRole();
      setRecommendedRole(role);

      // Start fetching custom roadmap from express backend API
      fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          skills,
          goal
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Custom roadmap successfully generated from backend:", data);
        setGeneratedRoadmap(data);
      })
      .catch(err => {
        console.error("Failed to generate custom roadmap:", err);
        setLoadingRoadmapError(err.message || "Failed to generate custom roadmap");
      });

      const timer = setInterval(() => {
        setCheckProgress((prev) => {
          if (prev < 4) {
            return prev + 1;
          }
          clearInterval(timer);
          // Auto advance to recommendation
          setTimeout(() => {
            setStep(4);
          }, 1500);
          return 4;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Interests constants (3x3 grid layout)
  const availableInterests = [
    { name: "UI/UX Designer", icon: Globe, color: "text-purple-500" },
    { name: "Data Analyst", icon: BarChart3, color: "text-blue-500" },
    { name: "Frontend Engineer", icon: Code, color: "text-sky-400" },
    { name: "Full Stack Developer", icon: Code, color: "text-emerald-500" },
    { name: "AI & ML Engineer", icon: Lightbulb, color: "text-yellow-500" },
    { name: "Cyber Security Analyst", icon: Shield, color: "text-red-500" },
    { name: "Cloud Engineer", icon: Cloud, color: "text-sky-500" },
    { name: "Digital Marketer", icon: Megaphone, color: "text-pink-500" },
    { name: "Product Manager", icon: LayoutGrid, color: "text-indigo-500" },
  ];

  // Skills constants (staggered tags)
  const availableSkills = [
    { name: "HTML" },
    { name: "CSS" },
    { name: "JavaScript" },
    { name: "Python" },
    { name: "Java" },
    { name: "SQL" },
    { name: "Figma" },
    { name: "Excel" },
    { name: "Power BI" },
    { name: "Communication" },
  ];

  // Career Goals constants
  const availableGoals = [
    { id: "intern", name: "Get an Internship", sub: "Kickstart my career", icon: GraduationCap },
    { id: "fulltime", name: "Get a Full-Time Job", sub: "Secure a good job", icon: Briefcase },
    { id: "switch", name: "Switch Career", sub: "Move to a new field", icon: RefreshCw },
    { id: "improve", name: "Improve Skills", sub: "Learn and grow", icon: Settings },
    { id: "jobready", name: "Become Job Ready", sub: "Prepare for opportunities", icon: Flame },
  ];

  const handleToggleInterest = (name: string) => {
    setInterests(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleToggleSkill = (name: string) => {
    setSkills(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  return (<div className="min-h-screen flex flex-col font-sans transition-colors duration-500 select-none bg-transparent text-white">
      
      {/* HEADER SECTION (Top navigation status bar) */}
      {step !== 3 && (
        <div className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 p-4 py-3 flex justify-between items-center z-15 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              id="btn-back-onboarding"
              onClick={handlePrevStep}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer"
            >
              ← Back
            </button>
          </div>

          {/* Stepped Progress Segment nodes */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 4].map((nodeIdx, idx) => {
              const isActive = step === nodeIdx || (nodeIdx === 4 && step === 4);
              const isPassed = step > nodeIdx;
              const title = ["Interests", "Skills", "Goals", "Ready"][idx];
              return (
                <div key={idx} className="flex items-center gap-1">
                  <div className={`h-6 px-3 rounded-full flex items-center justify-center text-[10px] font-extrabold tracking-wider transition-all uppercase ${
                    isActive ? "bg-[#6342E8] text-white shadow-md shadow-purple-500/20 border border-white/10" : 
                    isPassed ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30" : "bg-white/5 border border-white/5 text-slate-400"
                  }`}>
                    {title}
                  </div>
                  {idx < 3 && <div className="w-2 md:w-6 h-0.5 bg-white/10"></div>}
                </div>
              );
            })}
          </div>

          <button 
            id="btn-skip-onboarding"
            onClick={() => onComplete({ interests, skills, goal, recommendedRole: determineRecommendedRole(), generatedRoadmap: null })}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
          >
            Skip Setup
          </button>
        </div>
      )}

      {/* ONBOARDING CONTENT PANEL */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN 5: Select Interests */}
          {step === 0 && (
            <motion.div 
              key="step-interests"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left">
                <span className="text-[11px] font-mono tracking-widest text-[#6342E8] uppercase font-bold">Step 1 of 3</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">What interests you?</h2>
                <p className="text-xs md:text-sm text-slate-350 mt-1">Choose your favorite technology paradigms or methodologies.</p>
              </div>

              {/* 2x4 layout of selected card blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableInterests.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected = interests.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleToggleInterest(item.name)}
                      className={`p-4 rounded-xl text-left border flex items-center justify-between transition-all group scale-active cursor-pointer relative ${
                        isSelected ? "bg-[#6342E8] border-[#6342E8] text-white shadow-lg shadow-purple-500/20" : 
                        "bg-white/5 border-white/10 hover:border-[#6342E8] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isSelected ? "bg-white/10 text-white" : "bg-white/10 text-[#6342E8]"}`}>
                          <IconComponent className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block text-white">{item.name}</span>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-purple-200" : "text-slate-400"}`}>
                            {item.name === "UI/UX Design" ? "Aesthetics & Journeys" : "Core industry track"}
                          </span>
                        </div>
                      </div>

                      {/* Top-right checkbox item indicator */}
                      {isSelected && (
                        <div className="bg-white rounded-full p-1 border border-purple-500 shadow-md">
                          <Check className="w-3.5 h-3.5 text-[#6342E8] stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom bar CTA */}
              <div className="pt-4 flex justify-end">
                <button
                  id="btn-interests-continue"
                  onClick={handleNextStep}
                  disabled={interests.length === 0}
                  className="bg-[#6342E8] hover:bg-[#5231db] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md cursor-pointer disabled:opacity-50 transition-all select-none"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: Select Skills */}
          {step === 1 && (
            <motion.div 
              key="step-skills"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left">
                <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-bold">Step 2 of 3</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">What skills do you already have?</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">Specify tools or technologies you are familiar with currently.</p>
              </div>

              {/* Staggered Tag pills lists */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xs">
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                  {availableSkills.map((tag) => {
                    const isSelected = skills.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        onClick={() => handleToggleSkill(tag.name)}
                        className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected ? "bg-[#6342E8] border-[#6342E8] text-white shadow-sm shadow-purple-500/10" : 
                          "bg-white/5 border-white/10 hover:border-[#6342E8] text-slate-300"
                        }`}
                      >
                        <span>{tag.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Navigation */}
              <div className="flex justify-between items-center pt-4">
                <button
                  id="btn-skills-back"
                  onClick={handlePrevStep}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  id="btn-skills-continue"
                  onClick={handleNextStep}
                  className="bg-[#6342E8] hover:bg-[#5231db] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md cursor-pointer transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 7: Selecting Career Goals */}
          {step === 2 && (
            <motion.div 
              key="step-goals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left">
                <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-bold">Step 3 of 3</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">What’s your goal?</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">Select your primary professional motivation currently.</p>
              </div>

              {/* Vertical stacked rows selections */}
              <div className="space-y-3">
                {availableGoals.map((row) => {
                  const GoalIcon = row.icon;
                  const isSelected = goal === row.name;
                  return (
                    <button
                      key={row.id}
                      onClick={() => setGoal(row.name)}
                      className={`w-full p-4 rounded-xl text-left border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? "bg-white/10 border-2 border-purple-500 ring-2 ring-purple-500/20 shadow-sm" : 
                        "bg-white/5 border-white/10 hover:border-[#6342E8] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${isSelected ? "bg-purple-500/25 text-purple-300" : "bg-white/5 text-slate-400"}`}>
                          <GoalIcon className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">{row.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{row.sub}</span>
                        </div>
                      </div>

                      {/* Right radio circle icon */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-[#6342E8]" : "border-white/20"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-[#6342E8] rounded-full animate-scale"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  id="btn-goals-back"
                  onClick={handlePrevStep}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  id="btn-generate-roadmap"
                  onClick={handleNextStep}
                  className="bg-[#6342E8] hover:bg-[#5231db] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md cursor-pointer transition-all"
                >
                  Generate My Roadmap <Sparkles className="w-4 h-4 fill-yellow-200 text-yellow-200" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 8: AI Processing Gradient State */}
          {step === 3 && (
            <motion.div 
              key="step-analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[460px] text-center text-white"
            >
              {/* Central Glowing Orb with friendly robot head digital avatar wrapper */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-60"></div>

                {/* Orb outline concentric circle */}
                <div className="w-36 h-36 rounded-full glass-panel-dark border-2 border-white/25 flex flex-col items-center justify-center relative select-none">
                  {/* Micro-robot head mock */}
                  <div className="w-16 h-12 bg-white rounded-2xl flex flex-col items-center justify-between p-2 pt-3 shadow-inner relative">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-550 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    {/* Curved digital mouth smiling */}
                    <div className="w-8 h-1.5 border-b-2 border-slate-700 rounded-full"></div>

                    {/* Left/right robot antennas */}
                    <div className="absolute -top-1 left-3 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <div className="absolute -top-1 right-3 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Status Header */}
              <h3 className="text-xl font-extrabold tracking-tight mb-1 animate-pulse">Analyzing Your Profile...</h3>
              <p className="text-xs text-slate-350 text-slate-400 max-w-[280px] mx-auto text-center leading-relaxed">
                Our AI is understanding your skills, interests, and professional goals.
              </p>

              {/* Progress Checklist Container glass panel */}
              <div className="w-full max-w-sm mt-8 p-5 rounded-2xl bg-slate-950/40 border border-white/10 text-left space-y-3.5">
                <div className="flex justify-between items-center text-xs font-mono tracking-wider">
                  <span className="text-slate-400">ACTIVITIES</span>
                  <span className="text-[#6342E8] font-bold">80% COMPLETE</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-250">Matching your skills</span>
                    {checkProgress >= 1 ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 font-bold" /> : <div className="w-4 h-4 rounded-full border border-white/20"></div>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-250">Analyzing career paths</span>
                    {checkProgress >= 2 ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 font-bold" /> : <div className="w-4 h-4 rounded-full border border-white/20"></div>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-250">Finding best opportunities</span>
                    {checkProgress >= 3 ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 font-bold" /> : <div className="w-4 h-4 rounded-full border border-white/20"></div>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-250">Building your roadmap</span>
                    {checkProgress >= 4 ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 font-bold" /> : <div className="w-4 h-4 rounded-full border border-white/20 animate-pulse"></div>}
                  </div>
                </div>

                {/* Loading track slider */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-[#6342E8] h-full rounded-full transition-all duration-1000" style={{ width: `${checkProgress * 25}%` }}></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 9: Career Recommendations Result Screen */}
          {step === 4 && (
            <motion.div 
              key="step-recommendation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left">
                <span className="text-xs bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold w-fit inline-block">
                  Onboarding Synthesizer Complete! 🎉
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2">Your Best Career Match</h2>
                <p className="text-xs text-slate-300">Based on your interests, tools, and goals, we recommend the following target path.</p>
              </div>

              {/* The Match Showcase Card */}
              <div className="bg-white/5 backdrop-blur-md text-white p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                
                {/* Visual highlights radial circle */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl"></div>

                {/* Left Match Score Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="#38bdf8" strokeWidth="6" fill="transparent" strokeDasharray="301.59" strokeDashoffset="12.06" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-sky-300">96%</span>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider">MATCH SCORE</span>
                  </div>
                </div>

                {/* Center text data */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="flex gap-2 items-center justify-center md:justify-start">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white block">{recommendedRole}</h3>
                    <div className="bg-orange-500/20 border border-orange-500/40 rounded-full px-2 py-0.5 text-[9px] text-orange-300 flex items-center gap-1 font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" /> High Demand
                    </div>
                  </div>

                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li className="flex items-center gap-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span>Matches your selected interests and tech stack completely.</span>
                    </li>
                    <li className="flex items-center gap-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span>Aligned with your chosen goal of {goal}.</span>
                    </li>
                    <li className="flex items-center gap-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span>Generates high industry growth and salary leverage.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Other Career Matches */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Other Recommended Matches</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getOtherMatchesForRole(recommendedRole).map((track, i) => {
                    const MatIcon = track.icon;
                    return (
                      <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
                            <MatIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{track.role}</span>
                            <span className="text-[9px] text-slate-400 block">{track.sub}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-xs text-purple-400 block">{track.score}</span>
                          <span className="text-[8px] text-slate-400 block">Match</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                <button
                  id="btn-goto-dashboard"
                  onClick={() => onComplete({ interests, skills, goal, recommendedRole, generatedRoadmap })}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-xl font-bold text-xs text-center transition-all cursor-pointer shadow-xs"
                >
                  Explore Dashboard
                </button>
                <button
                  id="btn-goto-roadmap"
                  onClick={() => onComplete({ interests, skills, goal, recommendedRole, generatedRoadmap })}
                  className="bg-[#6342E8] hover:bg-[#5231db] text-white px-8 py-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all animate-scale"
                >
                  View Learning Roadmap <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
