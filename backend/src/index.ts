import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import eventsRouter from './routes/events.js';
import geocodeRouter from './routes/geocode.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use('/api/events', eventsRouter);
app.use('/api/geocode', geocodeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Lorcana Found backend running on http://localhost:${PORT}`);
});
