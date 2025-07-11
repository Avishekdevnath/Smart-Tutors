import mongoose, { Schema, models, model } from 'mongoose';

const LocationSchema = new Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  formatted: { type: String }, // For AI-formatted string, optional
  extra: { type: Schema.Types.Mixed }, // For any additional AI-extracted info
}, { timestamps: true });

const Location = models.Location || model('Location', LocationSchema);
export default Location; 