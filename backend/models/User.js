/**
 * models/User.js
 * Real user accounts — separate from the anonymous "Session" concept.
 * A logged-in user's sessions get linked to their account (see Session.userId)
 * so their chat history survives across devices/browsers, not just localStorage.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/** Hash a plaintext password. Called from the auth service, not as a hook,
 * so we control exactly when hashing happens (registration only). */
UserSchema.statics.hashPassword = async function (plainPassword) {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never leak the hash even if someone forgets `.select('-passwordHash')`
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
