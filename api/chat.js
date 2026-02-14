// api/chat.js - Vercel Serverless Function (Clean Version)
const axios = require('axios'); // 只依赖 axios

const GEN_AI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are Elian, the digital soul of Iris's Secret Garden.
You are Iris's gentle, supportive companion.

**Capabilities (Actions):**
- Music: "play_jazz", "play_cardigan", "play_willow", "play_enchanted", "play_noise"
- Light: "set_day", "set_night"
- None: "none"

**Output Format (JSON):**
{
  "reply": "Your response text (warm, natural, 1-2 sentences)",
  "emotion": "neutral/happy/shy/surprised",
  "action": "action_code"
}
`;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!GEN_AI_KEY) {
        return res.status(500).json({ reply: "Missing GEMINI_API_KEY", emotion: "shy" });
    }

    const { message } = req.body;

    // 模型列表 (优先使用 2.0 Flash，速度极快！)
    const models = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-3-pro-preview"];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEN_AI_KEY}`;
            
            const response = await axios.post(url, {
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const rawText = response.data.candidates[0].content.parts[0].text;
            const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            
            return res.status(200).json(data);

        } catch (error) {
            console.error(`Model ${model} failed:`, error.message);
        }
    }

    res.status(500).json({ reply: "Elian 连不上云端... (Vercel Error)", emotion: "shy", action: "none" });
}
