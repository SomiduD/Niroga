require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const chatRouter = require('./routes/chat');
const soapRouter = require('./routes/soap');
const clinicsRouter = require('./routes/clinics');
const visitsRouter = require('./routes/visits');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');

app.use('/api/chat', chatRouter);
app.use('/api/soap', soapRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    app: 'Niroga API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🌿 Niroga API running on http://localhost:${PORT}`);
  console.log(`   AI: Ollama @ ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
  console.log(`   Model: ${process.env.OLLAMA_MODEL || 'llama3.2'}\n`);
});
