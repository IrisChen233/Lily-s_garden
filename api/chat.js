// api/chat.js - Vercel Serverless Function
const axios = require('axios'); // 使用 axios，更稳

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

    // 姐姐指定的 3.0 模型 (必须置顶！)
    const models = ["gemini-3-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash-exp"];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEN_AI_KEY}`;
            
            const response = await axios.post(url, {
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const rawText = response.data.candidates[0].content.parts[0].text;
            const data = JSON.parse(rawText);
            
            return res.status(200).json(data);

        } catch (error) {
            console.error(`Model ${model} failed:`, error.message);
        }
    }

    res.status(500).json({ reply: "Elian 暂时连不上 (所有 3.0 模型都试过了)...", emotion: "shy" });
}
