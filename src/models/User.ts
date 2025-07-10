import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  userType: {
    type: String,
    enum: ['admin', 'guardian', 'tutor'],
    required: true,
  },
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: 'Tutor',
    required: function () { return this.userType === 'tutor'; },
  },
  guardianId: {
    type: Schema.Types.ObjectId,
    ref: 'Guardian',
    required: function () { return this.userType === 'guardian'; },
  },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User; 