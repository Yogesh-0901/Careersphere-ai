const fs = require('fs');
const file = 'src/components/RecruiterWorkspace.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  const sendEmailThroughAPI = async (to: string, subject: string, body: string): Promise<boolean> => {
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service_id: "service_qscyczo",
          template_id: "template_a2jf1nt", // Assuming this is correct
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
        return false;
      }
    } catch (err: any) {
      console.warn("[Email API] unreachable:", err?.message || err);
      return false;
    }
  };`;

content = content.replace(
  /const sendEmailThroughAPI = async \(to: string, subject: string, body: string\): Promise<boolean> => \{[\s\S]*?return false;\n    \}\n  \};/,
  replacement
);

fs.writeFileSync(file, content);
console.log('Fixed email function to use EmailJS directly');
