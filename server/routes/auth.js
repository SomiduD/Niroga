const express = require('express');
const router = express.Router();

// Demo credentials (in production would use bcrypt + JWT with DB)
const DEMO_USERS = [
  { id:1, name:'Dr. Amara Perera', username:'worker1', password:'niroga123', role:'health_worker', district:'Colombo' },
  { id:2, name:'Dr. Suresh Kumar', username:'worker2', password:'niroga123', role:'health_worker', district:'Kandy' },
  { id:3, name:'Admin Niroga', username:'admin', password:'admin123', role:'admin', district:'All' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = DEMO_USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, token: Buffer.from(JSON.stringify(userSafe)).toString('base64'), message: 'Login successful' });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString());
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
