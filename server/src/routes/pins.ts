import { Router } from 'express';
import type { Response } from 'express';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { Realm } from '../models/Realm.js';
import { Pin } from '../models/Pin.js';

const router = Router();
router.use(authMiddleware);

async function assertRealm(userId: string, realmId: string) {
  return Realm.findOne({ _id: realmId, userId }).lean();
}

router.get('/realm/:realmId', async (req: AuthedRequest, res: Response) => {
  const realmId = String(req.params.realmId);
  const realm = await assertRealm(req.userId!, realmId);
  if (!realm) {
    res.status(404).json({ error: 'Realm not found' });
    return;
  }
  const pins = await Pin.find({ realmId: realm._id, userId: req.userId }).sort({ updatedAt: -1 }).lean();
  res.json(
    pins.map((p) => ({
      id: p._id.toString(),
      label: p.label,
      x: p.x,
      y: p.y ?? null,
      z: p.z,
      notes: p.notes ?? '',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  );
});

router.post('/realm/:realmId', async (req: AuthedRequest, res: Response) => {
  const realmId = String(req.params.realmId);
  const realm = await assertRealm(req.userId!, realmId);
  if (!realm) {
    res.status(404).json({ error: 'Realm not found' });
    return;
  }
  const label = String(req.body?.label ?? '').trim();
  const x = Number(req.body?.x);
  const z = Number(req.body?.z);
  const yRaw = req.body?.y;
  const y = yRaw === undefined || yRaw === null || yRaw === '' ? undefined : Number(yRaw);
  const notes = String(req.body?.notes ?? '').trim();

  if (!label || !Number.isFinite(x) || !Number.isFinite(z)) {
    res.status(400).json({ error: 'label, x, and z are required (numbers)' });
    return;
  }
  if (y !== undefined && !Number.isFinite(y)) {
    res.status(400).json({ error: 'y must be a number when provided' });
    return;
  }

  const pin = await Pin.create({
    userId: req.userId,
    realmId: realm._id,
    label,
    x,
    z,
    ...(y !== undefined ? { y } : {}),
    notes,
  });
  res.status(201).json({
    id: pin.id,
    label: pin.label,
    x: pin.x,
    y: pin.y ?? null,
    z: pin.z,
    notes: pin.notes,
    createdAt: pin.createdAt,
    updatedAt: pin.updatedAt,
  });
});

router.patch('/:id', async (req: AuthedRequest, res: Response) => {
  const pin = await Pin.findOne({ _id: String(req.params.id), userId: req.userId });
  if (!pin) {
    res.status(404).json({ error: 'Pin not found' });
    return;
  }
  if (req.body.label !== undefined) pin.label = String(req.body.label).trim();
  if (req.body.x !== undefined) pin.x = Number(req.body.x);
  if (req.body.z !== undefined) pin.z = Number(req.body.z);
  if (req.body.y !== undefined) {
    const yRaw = req.body.y;
    pin.y = yRaw === null || yRaw === '' ? undefined : Number(yRaw);
  }
  if (req.body.notes !== undefined) pin.notes = String(req.body.notes).trim();

  if (!pin.label || !Number.isFinite(pin.x) || !Number.isFinite(pin.z)) {
    res.status(400).json({ error: 'label, x, and z must be valid' });
    return;
  }
  if (pin.y !== undefined && !Number.isFinite(pin.y)) {
    res.status(400).json({ error: 'y must be a number when set' });
    return;
  }

  await pin.save();
  res.json({
    id: pin.id,
    label: pin.label,
    x: pin.x,
    y: pin.y ?? null,
    z: pin.z,
    notes: pin.notes,
    createdAt: pin.createdAt,
    updatedAt: pin.updatedAt,
  });
});

router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  const r = await Pin.findOneAndDelete({ _id: String(req.params.id), userId: req.userId });
  if (!r) {
    res.status(404).json({ error: 'Pin not found' });
    return;
  }
  res.status(204).send();
});

export default router;
