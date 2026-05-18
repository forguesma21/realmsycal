import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    realmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Realm', required: true, index: true },
    label: { type: String, required: true, trim: true },
    x: { type: Number, required: true },
    y: { type: Number },
    z: { type: Number, required: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

export type PinDoc = mongoose.InferSchemaType<typeof pinSchema> & { _id: mongoose.Types.ObjectId };
export const Pin = mongoose.model('Pin', pinSchema);
