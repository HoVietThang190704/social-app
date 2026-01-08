import mongoose, { Schema, Document } from 'mongoose';

export interface ILivestream extends Document {
  title: string;
  creatorId: mongoose.Types.ObjectId;
}

const LivestreamSchema = new Schema({
  title: { type: String },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'livestreams' });

export const Livestream = mongoose.model<ILivestream>('Livestream', LivestreamSchema);