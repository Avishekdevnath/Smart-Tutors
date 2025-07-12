import mongoose, { Schema, models, model } from 'mongoose';

const LocationSchema = new Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  subarea: { type: String }, // NEW: optional subarea field
  formatted: { type: String }, // For AI-formatted string, optional
  extra: { type: Schema.Types.Mixed }, // For any additional AI-extracted info
}, { timestamps: true });

LocationSchema.index({ division: 1, district: 1, area: 1, subarea: 1 }, { unique: true });

const Location = models.Location || model('Location', LocationSchema);
export default Location; 