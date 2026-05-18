import mongoose from 'mongoose';

const realmSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

realmSchema.index({ userId: 1, name: 1 }, { unique: true });

export type RealmDoc = mongoose.InferSchemaType<typeof realmSchema> & { _id: mongoose.Types.ObjectId };
export const Realm = mongoose.model('Realm', realmSchema);
