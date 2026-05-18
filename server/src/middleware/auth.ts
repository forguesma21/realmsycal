import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthedRequest = Request & { userId?: string };

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, secret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}
