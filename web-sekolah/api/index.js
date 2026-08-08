const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ status: 'success', data: { user: { id: user.id, email: user.email }, accessToken: token } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All other routes
app.all('*', (req, res) => {
  res.json({ message: 'SISTech API', path: req.path, method: req.method });
});

module.exports = app;