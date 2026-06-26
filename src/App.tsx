import { useState } from "react";
import SplashView from "./components/SplashView";
import HeroSplitView from "./components/HeroSplitView";
import AuthView from "./components/AuthView";
import OnboardingFlow from "./components/OnboardingFlow";
import CandidateWorkspace from "./components/CandidateWorkspace";
import RecruiterWorkspace from "./components/RecruiterWorkspace";
import { initializeFirebaseAdapter } from "./firebaseAdapter";

export default function App() {
  // Routes: 'splash' | 'hero' | 'auth' | 'onboarding' | 'candidate' | 'recruiter'
  const [route, setRoute] = useState<'splash' | 'hero' | 'auth' | 'onboarding' | 'candidate' | 'recruiter'>('splash');
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<'student' | 'recruiter' | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  const handleLaunchSplash = () => {
    setRoute('hero');
  };

  const handleGetStartedHero = () => {
    setRoute('auth');
  };

  const handleAuthComplete = (email: string, role: 'student' | 'recruiter', name: string) => {
    // Inject Firebase global adapter
    window.localStorage.setItem("cs_current_user_email", email.toLowerCase());
    initializeFirebaseAdapter(email, role);
    setUserEmail(email);
    setUserName(name);
    setUserRole(role);

    if (role === 'student') {
      try {
        const stored = localStorage.getItem("cs_registered_candidates") || "[]";
        const list = JSON.parse(stored);
        const exists = list.some((c: any) => c.email.toLowerCase() === email.toLowerCase());
        if (!exists) {
          const newCandidate = {
            id: email.toLowerCase().replace(/[^a-z0-9]/g, ""),
            name: name || email.split('@')[0],
            email: email,
            role: "UI/UX Designer", // default
            exp: "Fresher",
            match: 0,
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            status: "New",
            resumeScore: null
          };
          list.push(newCandidate);
          localStorage.setItem("cs_registered_candidates", JSON.stringify(list));
        }
      } catch (e) {
        console.error("Failed to register candidate:", e);
      }
    }

    if (role === 'recruiter') {
      setRoute('recruiter');
    } else {
      setRoute('onboarding');
    }
  };

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding data submitted: ", data);
    setOnboardingData(data);

    try {
      const stored = localStorage.getItem("cs_registered_candidates") || "[]";
      const list = JSON.parse(stored);
      const updated = list.map((c: any) => {
        if (c.email.toLowerCase() === userEmail.toLowerCase()) {
          return { ...c, role: data.recommendedRole || "UI/UX Designer" };
        }
        return c;
      });
      localStorage.setItem("cs_registered_candidates", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update candidate role:", e);
    }

    setRoute('candidate');
  };

  const handleLogout = () => {
    setUserEmail("");
    setUserName("");
    setUserRole(null);
    setRoute('hero');
  };

  return (
    <div className="w-full min-h-screen bg-[#0B0E2E] select-none text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Frosted Glass Background Ambient Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,#1D174F,transparent),radial-gradient(circle_at_bottom_left,#0B0E2E,transparent)] pointer-events-none -z-10"></div>
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="relative z-10 flex-1 flex flex-col min-h-screen">
        {route === 'splash' && (
          <SplashView onComplete={handleLaunchSplash} />
        )}

        {route === 'hero' && (
          <HeroSplitView 
            onStart={handleGetStartedHero} 
            onSkipToDashboard={() => setRoute('candidate')} 
          />
        )}

        {route === 'auth' && (
          <AuthView 
            onAuthSuccess={handleAuthComplete} 
            onBack={() => setRoute('hero')} 
          />
        )}

        {route === 'onboarding' && (
          <OnboardingFlow 
            onComplete={handleOnboardingComplete} 
            onBack={() => setRoute('auth')} 
          />
        )}

        {route === 'candidate' && (
          <CandidateWorkspace 
            userEmail={userEmail} 
            userName={userName}
            userRole={userRole}
            onboardingData={onboardingData}
            onLogout={handleLogout} 
            onNavigateToRecruiter={() => setRoute('recruiter')} 
          />
        )}

        {route === 'recruiter' && (
          <RecruiterWorkspace 
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
            onNavigateToCandidate={() => setRoute('candidate')} 
          />
        )}
      </div>

    </div>
  );
}
