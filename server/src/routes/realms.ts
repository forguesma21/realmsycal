import { Router } from 'express';
import type { Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { Realm } from '../models/Realm.js';
import { Pin } from '../models/Pin.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const realms = await Realm.find({ userId: req.userId }).sort({ updatedAt: -1 }).lean();
  res.json(
    realms.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  );
});

router.post('/', async (req: AuthedRequest, res: Response) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  try {
    const realm = await Realm.create({ userId: req.userId, name });
    res.status(201).json({
      id: realm.id,
      name: realm.name,
      createdAt: realm.createdAt,
      updatedAt: realm.updatedAt,
    });
  } catch (e) {
    if (e instanceof mongoose.mongo.MongoServerError && e.code === 11000) {
      res.status(409).json({ error: 'You already have a realm with this name' });
      return;
    }
    throw e;
  }
});

router.patch('/:id', async (req: AuthedRequest, res: Response) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const realm = await Realm.findOneAndUpdate(
    { _id: String(req.params.id), userId: req.userId },
    { name },
    { new: true },
  ).lean();
  if (!realm) {
    res.status(404).json({ error: 'Realm not found' });
    return;
  }
  res.json({
    id: realm._id.toString(),
    name: realm.name,
    createdAt: realm.createdAt,
    updatedAt: realm.updatedAt,
  });
});

router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const r = await Realm.findOneAndDelete({ _id: String(req.params.id), userId: req.userId }).session(session);
    if (!r) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Realm not found' });
      return;
    }
    await Pin.deleteMany({ realmId: r._id, userId: req.userId }).session(session);
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

export default router;
