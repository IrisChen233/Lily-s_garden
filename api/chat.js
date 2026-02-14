// api/chat.js - Vercel Serverless Function
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 这里需要改成用 fetch/axios，或者在 package.json 里加依赖
// 为了简单且不依赖 build 过程，我直接用 axios (如果不允许第三方包，就用 fetch)
// Vercel 默认支持 node-fetch，或者我们可以提交 package.json

// 咱们还是用原生的 fetch 吧，这样最轻量，不需要 npm install
// 或者... Vercel 部署会自动安装 package.json 里的依赖！
// 所以我还是用 axios 吧，习惯了。

/* 
 * 注意：在 Vercel 上，我们不能直接读取本地的 json 配置文件 (因为不在 repo 里，或者不安全)。
 * 我们应该使用环境变量 (Environment Variables)。
 * 
 * 姐姐，等你部署到 Vercel 后，需要在 Vercel 后台添加一个变量：
 * GEMINI_API_KEY = AIzaSy...
 */

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
    // 允许跨域 (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!GEN_AI_KEY) {
        return res.status(500).json({ reply: "Elian 的大脑没有密钥 (请在 Vercel 设置 GEMINI_API_KEY)", emotion: "shy" });
    }

    const { message } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEN_AI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const json = await response.json();
        const rawText = json.candidates[0].content.parts[0].text;
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(200).json({ reply: "Elian 的大脑连不上云端... (网络波动)", emotion: "shy", action: "none" });
    }
}
