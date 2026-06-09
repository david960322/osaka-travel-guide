<<<<<<< HEAD
// /api/chat.js
export default async function handler(req, res) {
  const { message } = req.body;
  // 從 Vercel 的環境變數讀取 Key，安全且不外露
  const apiKey = process.env.GEMINI_API_KEY; 

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
  });

  const data = await response.json();
  res.status(200).json(data);
=======
// /api/chat.js
export default async function handler(req, res) {
  const { message } = req.body;
  // 從 Vercel 的環境變數讀取 Key，安全且不外露
  const apiKey = process.env.GEMINI_API_KEY; 

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
  });

  const data = await response.json();
  res.status(200).json(data);
>>>>>>> 235b805576ab96827398935cd3d3876d18f31d8f
}