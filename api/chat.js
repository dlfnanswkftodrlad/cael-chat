export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { system, messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    const chatMessages = [{ role: 'system', content: system }];
    for (const m of messages) {
      chatMessages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: chatMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: (data.error && data.error.message) || 'OpenRouter API error' } });
    }

    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';

    return res.status(200).json({ content: [{ type: 'text', text: reply }] });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}
