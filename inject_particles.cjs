const fs = require('fs');

const injectParticles = (file, findStr, injectStr) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<AntiGravityParticles />')) {
    console.log(`Already injected in ${file}`);
    return;
  }
  if (!content.includes('import AntiGravityParticles')) {
    const lines = content.split('\n');
    lines.splice(1, 0, 'import AntiGravityParticles from "./AntiGravityParticles";');
    content = lines.join('\n');
  }
  
  content = content.replace(findStr, injectStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Injected in ${file}`);
}

// MockInterviewPortal.tsx
// Look for its outermost div
injectParticles('src/components/MockInterviewPortal.tsx', 
  '<div className="min-h-screen bg-transparent flex flex-col font-sans select-none relative overflow-hidden text-slate-800 dark:text-slate-200">',
  '<div className="min-h-screen bg-transparent flex flex-col font-sans select-none relative overflow-hidden text-slate-800 dark:text-slate-200">\n      <AntiGravityParticles />'
);

// OnboardingFlow.tsx
injectParticles('src/components/OnboardingFlow.tsx',
  '<div className="min-h-screen bg-[#07091E] flex flex-col justify-between font-sans select-none relative overflow-hidden">',
  '<div className="min-h-screen bg-[#07091E] flex flex-col justify-between font-sans select-none relative overflow-hidden">\n      <AntiGravityParticles />'
);

// RecruiterWorkspace.tsx
injectParticles('src/components/RecruiterWorkspace.tsx',
  'className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] dark:bg-gradient-to-br dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-slate-900 dark:text-slate-200 flex flex-col md:flex-row font-sans relative overflow-x-hidden selection:bg-purple-500/30">',
  'className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] dark:bg-gradient-to-br dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] text-slate-900 dark:text-slate-200 flex flex-col md:flex-row font-sans relative overflow-x-hidden selection:bg-purple-500/30">\n      <AntiGravityParticles />'
);

