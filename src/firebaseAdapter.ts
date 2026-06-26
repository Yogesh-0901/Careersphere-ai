import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, updateDoc } from "firebase/firestore";

let isInitialized = false;

// We will fetch all data from Firestore ONCE and populate localStorage
export const initializeFirebaseAdapter = async (userEmail: string, userRole: string) => {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Sync Candidates List globally
    onSnapshot(collection(db, "candidates"), (snapshot) => {
      const cands = snapshot.docs.map(doc => doc.data());
      localStorage.setItem("cs_registered_candidates", JSON.stringify(cands));
      window.dispatchEvent(new Event("storage")); // Trigger React re-renders
    });

    // 2. Sync Specific User Data
    if (userEmail) {
      // Mock Interview History
      onSnapshot(doc(db, "interviews", userEmail.toLowerCase()), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.history) {
            localStorage.setItem("cs_interview_history", JSON.stringify(data.history));
            window.dispatchEvent(new Event("storage"));
          }
        }
      });

      // AI Mentor Chat History
      onSnapshot(doc(db, "chats", userEmail.toLowerCase()), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.messages) {
            localStorage.setItem(`cs_mentor_chat_\${userEmail}`, JSON.stringify(data.messages));
            window.dispatchEvent(new Event("storage"));
          }
        }
      });
    }

    // 3. Sync Recruiter Company Profile
    onSnapshot(doc(db, "company", "profile"), (docSnap) => {
      if (docSnap.exists()) {
        localStorage.setItem("cs_recruiter_company_profile", JSON.stringify(docSnap.data()));
        window.dispatchEvent(new Event("storage"));
      }
    });

  } catch (err) {
    console.error("Firebase adapter init failed", err);
  }
};

// 4. Intercept all localStorage writes and push to Firestore
const originalSetItem = window.localStorage.setItem;

window.localStorage.setItem = async function(key: string, value: string) {
  // Always do the local write so UI feels instant
  originalSetItem.apply(this, [key, value]);

  try {
    const parsed = JSON.parse(value);

    // If a component updates the whole candidates array, update all documents
    if (key === "cs_registered_candidates") {
      if (Array.isArray(parsed)) {
        // Just update the ones that changed or simply write them all
        parsed.forEach(async (cand: any) => {
          if (cand.email) {
            await setDoc(doc(db, "candidates", cand.email.toLowerCase()), cand, { merge: true });
          }
        });
      }
    }
    
    // If a component updates the company profile
    if (key === "cs_recruiter_company_profile") {
      await setDoc(doc(db, "company", "profile"), parsed, { merge: true });
    }

    // If a component updates interview history (we need user email, but we might not have it in the payload)
    // Actually, history updates happen from MockInterviewPortal, we can store a global current user email
    const currentUser = window.localStorage.getItem("cs_current_user_email");
    
    if (key === "cs_interview_history" && currentUser) {
      await setDoc(doc(db, "interviews", currentUser), { history: parsed }, { merge: true });
    }

    // AI Mentor Chat
    if (key.startsWith("cs_mentor_chat_")) {
      const email = key.replace("cs_mentor_chat_", "");
      await setDoc(doc(db, "chats", email), { messages: parsed }, { merge: true });
    }

  } catch (err) {
    // Silent fail for non-JSON or other local variables
  }
};
