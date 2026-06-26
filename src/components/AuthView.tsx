import React, { useState } from "react";
import AntiGravityParticles from "./AntiGravityParticles";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Rocket, Star, ShieldCheck, CheckCircle, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";interface AuthViewProps {
  onAuthSuccess: (email: string, role: 'student' | 'recruiter', name: string) => void;
  onBack: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthView({ onAuthSuccess, onBack, initialMode = 'login' }: AuthViewProps) {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [isForgot, setIsForgot] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter'>('student');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please fill in your email address.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail address (ending in @gmail.com).");
      return;
    }

    if (isSignup) {
      if (selectedRole === 'recruiter' && adminPasscode !== 'CAREER_ADMIN_2026') {
        setError("Invalid Admin Passcode. You are not authorized to create a Recruiter account.");
        return;
      }
      if (!fullName) {
        setError("Please clarify your full name.");
        return;
      }
      if (!password) {
        setError("Please enter a password.");
        return;
      }
      if (password.length !== 6) {
        setError("Password must be exactly 6 characters long.");
        return;
      }
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasLetter || !hasNumberOrSymbol) {
        setError("Password must contain both letters and numbers/symbols.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
        
        await setDoc(doc(db, "users", email.toLowerCase()), {
          email: email.toLowerCase(),
          name: fullName,
          role: selectedRole
        });

        if (selectedRole === 'student') {
          await setDoc(doc(db, "candidates", email.toLowerCase()), {
            id: email.toLowerCase().replace(/[^a-z0-9]/g, ""),
            name: fullName,
            email: email.toLowerCase(),
            role: "UI/UX Designer",
            exp: "Fresher",
            match: 0,
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            status: "New",
            resumeScore: null
          });
        }

        setSuccess("Account successfully registered! Please login to continue.");
        setTimeout(() => {
          setIsSignup(false);
          setSuccess("");
          setPassword("");
          setConfirmPassword("");
        }, 1500);

      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError("An account with this email already exists. Please login.");
        } else {
          setError("Registration failed: " + err.message);
        }
      }
    } else {
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
        const userDoc = await getDoc(doc(db, "users", email.toLowerCase()));
        
        let role = 'student';
        let name = email.split('@')[0];
        
        if (userDoc.exists()) {
          role = userDoc.data().role;
          name = userDoc.data().name;
        }

        if (role !== selectedRole) {
          setError(`This email is registered as a ${role === 'student' ? 'Student' : 'Recruiter'}. Please switch your role selection.`);
          await auth.signOut();
          return;
        }

        setSuccess("Welcome back! Instating secure credentials...");
        setTimeout(() => {
          onAuthSuccess(email.toLowerCase(), role as 'student' | 'recruiter', name);
        }, 1000);

      } catch (err: any) {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail address (ending in @gmail.com).");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Please check your inbox.");
      setTimeout(() => {
        setIsForgot(false);
        setError("");
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      setError("Failed to send reset email. Make sure you are registered.");
    }
  };

  const triggerSocialLogin = async (prov: string) => {
    if (prov === "Google") {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const user = res.user;
        const email = user.email || "";
        const userDoc = await getDoc(doc(db, "users", email.toLowerCase()));
        
        let role = selectedRole;
        let name = user.displayName || email.split("@")[0];
        
        if (userDoc.exists()) {
          role = userDoc.data().role;
          name = userDoc.data().name;
        } else {
          await setDoc(doc(db, "users", email.toLowerCase()), { email: email.toLowerCase(), name, role });
          if (role === 'student') {
            await setDoc(doc(db, "candidates", email.toLowerCase()), {
              id: email.replace(/[^a-z0-9]/g, ""),
              name: name,
              email: email.toLowerCase(),
              role: "UI/UX Designer",
              exp: "Fresher",
              match: 0,
              date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
              status: "New",
              resumeScore: null
            });
          }
        }
        setSuccess("Connected with Google!");
        setTimeout(() => {
          onAuthSuccess(email.toLowerCase(), role as 'student' | 'recruiter', name);
        }, 1000);
      } catch (err: any) {
        setError("Google sign in failed.");
      }
    } else {
      setError(`${prov} login is not configured yet.`);
    }
  };

  return (<div className="min-h-screen bg-transparent flex items-center justify-center p-4 md:p-8 select-none">
      <AntiGravityParticles />
      
      {/* 50/50 Swapped Split Card Layout for beautiful flows */}
      <div className="w-full max-w-4xl bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] border border-white/10 relative">
        
        {/* Back Arrow Button */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN (Left 45% Split): Cool visual illustration */}
        <div className="hidden md:flex md:col-span-5 bg-white/[0.01] border-r border-white/10 p-8 flex-col justify-center text-white relative overflow-hidden">
          {/* Particles */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full blur-xs font-mono floating-element"></div>
          <div className="absolute bottom-20 right-10 w-3.5 h-3.5 bg-blue-400 rounded-full blur-xs floating-element-slow"></div>

          <div className="text-center flex flex-col items-center justify-center">
            {isForgot ? (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <div className="w-28 h-28 bg-yellow-500/20 rounded-full border border-yellow-400/30 flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                  <Lock className="w-16 h-16 text-yellow-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reset Password</h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                  Provide your registered email and choose a new secure password to restore access to your profile.
                </p>
              </motion.div>
            ) : isSignup ? (
              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="w-28 h-28 bg-purple-500/20 rounded-full border border-purple-500/30 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 relative">
                  <Rocket className="w-16 h-16 text-purple-300 transform -rotate-45" />
                  <Star className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 fill-yellow-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Launch Your Journey</h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                  Complete onboarding to synthesize targeted skills, roadmap milestones, and unlock direct recruit pools.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <div className="w-28 h-28 bg-blue-500/20 rounded-full border border-blue-400/30 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-16 h-16 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Lock In Progress</h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                  Access your mock interview reviews, personalized syllabus tiers, and Nexis AI corporate settings.
                </p>
              </motion.div>
            )}
          </div>
        </div>        {/* RIGHT COLUMN (Right 55% Split): Sleek Centered Card Form for Windows/Mac Keyboard navigation */}
        <div className="col-span-1 md:col-span-12 md:col-start-6 p-8 md:p-12 flex flex-col justify-center bg-transparent relative">
          
          <div className="mb-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {isForgot ? "Reset Password" : isSignup ? "Create Your Account" : "Welcome Back!"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              {isForgot ? "Enter your new credentials to update and login" : isSignup ? "Start your career transformation today" : "Login to continue your career journey"}
            </p>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex gap-2 items-center select-text">
              <span>⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex gap-2 items-center select-text">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {isForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6342E8] focus:bg-white/10 text-white font-medium transition-all"
                  />
                </div>
              </div>


              <button
                type="submit"
                className="w-full bg-[#6342E8] hover:bg-[#5231db] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer mt-2"
              >
                Send Password Reset Email →
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setIsForgot(false);
                  }}
                  className="text-xs text-purple-400 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Core Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6342E8] focus:bg-white/10 text-white font-medium transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                    Select Your Role
                  </label>
                  <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-2 select-none">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === 'student' ? 'bg-[#6342E8] text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Student / Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('recruiter')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedRole === 'recruiter' ? 'bg-[#6342E8] text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      Recruiter / Employer
                    </button>
                  </div>
                </div>

                {isSignup && selectedRole === 'recruiter' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                    <label className="block text-[11px] font-bold text-yellow-400 uppercase tracking-widest mb-1.5">
                      Admin Passcode <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-yellow-500/50">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="Enter secret recruiter code"
                        className="block w-full pl-10 pr-4 py-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-yellow-500/10 text-white font-medium transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6342E8] focus:bg-white/10 text-white font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                      Password
                    </label>
                    {!isSignup && (
                      <button 
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setIsForgot(true);
                        }}
                        className="text-[10px] text-purple-400 font-bold hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6342E8] focus:bg-white/10 text-white font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-250"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="block w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6342E8] focus:bg-white/10 text-white font-medium transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Submit full width */}
                <button
                  type="submit"
                  className="w-full bg-[#6342E8] hover:bg-[#5231db] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer mt-2"
                >
                  {isSignup ? "Create Account →" : "Login →"}
                </button>
              </form>

              {/* Social login integration */}
              <div className="mt-6">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-400 font-mono">or continue with</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-3">
                  <button 
                    onClick={() => triggerSocialLogin("Google")}
                    className="flex items-center justify-center gap-2 py-2.5 border border-white/10 bg-white/5 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all select-none cursor-pointer"
                  >
                    <span className="text-red-400">G</span>
                    <span>Google</span>
                  </button>
                </div>
              </div>

              {/* Footer toggle switcher */}
              <div className="text-center mt-6">
                <span className="text-xs text-slate-400">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}
                </span>{" "}
                <button 
                  onClick={() => {
                    setError("");
                    setIsSignup(!isSignup);
                  }}
                  className="text-xs text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  {isSignup ? "Login" : "Sign Up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
