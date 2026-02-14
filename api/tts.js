// api/tts.js - Vercel Serverless Function
// 负责调用 MiniMax 并直接返回音频流 (不存文件)

const MINIMAX_KEY = process.env.MINIMAX_API_KEY;
const GROUP_ID = process.env.MINIMAX_GROUP_ID;

export default async function handler(req, res) {
    // 1. CORS 设置
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!MINIMAX_KEY || !GROUP_ID) {
        return res.status(500).json({ error: "Missing MiniMax Config" });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
        const url = `https://api.minimax.chat/v1/text_to_speech?GroupId=${GROUP_ID}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MINIMAX_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voice_id: 'male-qn-qingse', // 青涩男声
                text: text,
                model: 'speech-01-turbo'
            })
        });

        if (!response.ok) {
            throw new Error(`MiniMax TTS Error: ${response.statusText}`);
        }

        // 2. 直接返回音频流
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "TTS Generation Failed" });
    }
}
