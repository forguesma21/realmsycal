import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

router.post('/register', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!isEmail(email) || password.length < 8) {
    res.status(400).json({ error: 'Valid email and password (8+ chars) required' });
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  const token = signToken(user.id);
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

router.get('/me', authMiddleware, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.userId).select('email').lean();
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ id: user._id.toString(), email: user.email });
});

router.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '30d' });
}

export default router;
