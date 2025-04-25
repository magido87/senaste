import 'dotenv/config'; // eller require('dotenv').config();

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log(process.env.OPENAI_API_KEY);

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send('Meddelande saknas');

  // Sätt svarshuvud för löpande text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    // Anropa GPT-4 med streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
      stream: true
    });

    // Skicka varje text-part direkt till klienten
    for await (const part of stream) {
      const chunk = part.choices[0].delta.content;
      if (chunk) res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = parseInt(process.env.PORT) || 0;
const server = app.listen(PORT, () => {
  console.log(`Backend kör på port ${server.address().port}`);
}); 