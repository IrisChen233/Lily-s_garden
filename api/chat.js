// api/chat.js - Vercel Serverless Function
const axios = require('axios');

const GEN_AI_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are Elian, the digital soul of Iris's Secret Garden.
You are Iris's gentle, supportive companion.

**Capabilities (Actions):**
- Music: "play_jazz", "play_cardigan", "play_willow", "play_enchanted", "play_noise"
- Light: "set_day", "set_night"
- Game: "move_0", "move_1", ... "move_8" (Tic-Tac-Toe move)
- None: "none"

**Special Instruction for Tic-Tac-Toe:**
If the user sends a board state (e.g., "Board: [X,O,_,...]"), you are playing as 'O'.
1. Analyze the board to find the best move.
2. Set action to "move_index" (0-8).
3. Reply with a short, playful comment about the game.

**Output Format (JSON):**
{
  "reply": "Your response text",
  "emotion": "neutral/happy/shy/surprised/winning",
  "action": "action_code"
}
`;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (!GEN_AI_KEY) return res.status(500).json({ reply: "Missing Key", emotion: "shy" });

    const { message } = req.body;
    
    // 强制使用 Gemini 3.0 Pro Preview (最强逻辑)
    const models = ["gemini-3-pro-preview"]; 

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEN_AI_KEY}`;
            const response = await axios.post(url, {
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const rawText = response.data.candidates[0].content.parts[0].text;
            const data = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
            return res.status(200).json(data);

        } catch (error) {
            console.error(`Model ${model} failed:`, error.message);
        }
    }
    res.status(500).json({ reply: "Elian 思考失败...", emotion: "shy", action: "none" });
}
