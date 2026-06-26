export interface CandidateProfile {
  name: string;
  avatar: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  matchScore: number;
  experience: string;
  status: 'In Review' | 'Shortlisted' | 'Rejected' | 'New' | 'Hired';
  about: string;
  education: string;
  languages: string[];
  availability: string;
  skills: { name: string; level: number; status: 'Advanced' | 'Intermediate' | 'Beginner' }[];
  missingSkills: { name: string; gap: number; priority: 'High' | 'Medium' | 'Low' }[];
  resumeScore: number;
  resumeFeedback: string;
  suggestions: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  selected: boolean;
}

export interface InterestItem {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

export interface CareerGoal {
  id: string;
  title: string;
  sub: string;
  icon: string;
}

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  skills: string[];
  applied?: boolean;
}

export interface InterviewMetric {
  communication: number;
  confidence: number;
  technical: number;
  problemSolving: number;
  professionalism: number;
  overall: number;
  feedback: string[];
  weaknesses: string[];
  suggestions: string[];
  resources: string[];
}

export interface InterviewSession {
  id: string;
  role: string;
  category: string;
  difficulty: string;
  score: number;
  date: string;
  duration: number; // minutes
}

export interface OnboardingState {
  interests: string[];
  skills: string[];
  goalId: string;
}
