import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import realmRoutes from './routes/realms.js';
import pinRoutes from './routes/pins.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const mongoUri = process.env.MONGODB_URI;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use('/api/auth', authRoutes);
app.use('/api/realms', realmRoutes);
app.use('/api/pins', pinRoutes);

async function main() {
  if (!mongoUri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`API http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
