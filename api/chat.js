export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { system, messages } = req.body;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: system }] }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: { message: data.error?.message || 'Gemini API error' } });
    }

    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
    return res.status(200).json({ content: [{ type: 'text', text: reply }] });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}
