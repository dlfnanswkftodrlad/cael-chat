export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { system, messages } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-1.5-flash';

    const contents = messages.map(function(m) {
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      };
    });

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: system }] }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: (data.error && data.error.message) || 'Gemini API error' } });
    }

    const candidate = data.candidates && data.candidates[0];
    const parts = candidate && candidate.content && candidate.content.parts;
    const reply = parts ? parts.map(function(p){ return p.text; }).join('\n') : '';

    return res.status(200).json({ content: [{ type: 'text', text: reply }] });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}
