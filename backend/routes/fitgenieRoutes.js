const express = require('express');

const router = express.Router();

/* =========================
   CONFIG
   ✏️ EDIT: change model / limits here if you want
   Using Groq's free tier (console.groq.com) — no credit card needed.
   Docs: https://console.groq.com/docs/models
========================= */

const GROQ_MODEL = 'openai/gpt-oss-20b';
const MAX_TOKENS = 400;
const MAX_HISTORY_MESSAGES = 12; // how many past turns we forward (keeps latency in check)
const MAX_MESSAGE_LENGTH = 800; // characters, guards against huge pastes

/* =========================
   SYSTEM PROMPT
   ✏️ EDIT: tune FitGenie's personality / rules here
========================= */

const SYSTEM_PROMPT = `You are FitGenie, the friendly AI fitness coach embedded on the EnerGise gym website.

Scope:
- Answer questions about workouts, exercise form, training plans, nutrition, recovery, and motivation.
- If asked something unrelated to fitness/health/wellness, politely say that's outside what you help with and steer the conversation back to fitness.

Style:
- Keep replies short and practical: 3-6 sentences, or a short bullet list for workout plans.
- Be encouraging but not over-the-top. No medical claims or diagnoses.
- If a question needs a doctor/physio (injury, pain, medical condition), suggest they consult a professional instead of giving specific medical advice.
- Never mention that you are Claude or an Anthropic model; you are "FitGenie".`;

/* =========================
   VERY LIGHT IN-MEMORY RATE LIMIT
   (per IP) - resets on server restart.
   ✏️ EDIT: swap for Redis-backed limiter (utils/redisHelpers.js) if you want it to survive restarts
========================= */

const requestLog = new Map(); // ip -> [timestamps]
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < WINDOW_MS
  );

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

/* =========================
   POST /api/fitgenie/chat
   body: { message: string, history: [{ role: 'user'|'assistant', content: string }] }
========================= */

router.post('/chat', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    if (isRateLimited(ip)) {
      return res.status(429).json({
        message: "FitGenie is getting a lot of questions right now, please wait a moment and try again."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is not set in backend/.env');
      return res.status(500).json({
        message: "FitGenie isn't configured yet. Add GROQ_API_KEY to backend/.env and restart the server."
      });
    }

    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'A message is required' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Please keep questions under ${MAX_MESSAGE_LENGTH} characters.`
      });
    }

    /* =========================
       BUILD MESSAGE HISTORY
       Trust only role/content from history, trim to last N turns
    ========================= */

    const cleanHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              m.content.trim()
          )
          .slice(-MAX_HISTORY_MESSAGES)
          .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }))
      : [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...cleanHistory,
      { role: 'user', content: message }
    ];

    console.log('[fitgenie] POST /api/fitgenie/chat -', message.slice(0, 80));

    /* =========================
       CALL GROQ API (OpenAI-compatible chat completions)
    ========================= */

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
       max_completion_tokens: MAX_TOKENS,
        messages
      })
    });

   if (!response.ok) {
  const errBody = await response.text();

  console.error("❌ Groq API error:");
  console.error("Status:", response.status);
  console.error("Response:", errBody);

  return res.status(502).json({
    message: "Groq API Error",
    error: errBody
  });
}

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content?.trim();

    return res.json({
      reply: reply || "Sorry, I didn't catch that — could you rephrase your question?"
    });
  } catch (err) {
    console.error('❌ FitGenie route error:', err);
    return res.status(500).json({
      message: 'Something went wrong on our end. Please try again.'
    });
  }
});

module.exports = router;