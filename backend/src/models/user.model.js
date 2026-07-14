'use strict';

const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * User account (formerly `Admin`). Every user belongs to exactly one Role,
 * which carries their permissions. Passwords are stored hashed and never
 * serialised. Users are created by a Super Admin through the Users module
 * (there is still no public self-registration).
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      // Excluded from queries by default; `.select('+password')` when auth needs it.
      select: false,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
      index: true,
    },
    // The seeded Root Super Admin. This account is protected: it cannot be
    // deleted, its role cannot be changed, and only the owner may edit it.
    // Set exclusively by the seeder — never settable through the API.
    isRoot: {
      type: Boolean,
      default: false,
    },
    // First-login state. New employees are created with a temporary password
    // and `mustChangePassword: true`; they are forced to set their own password
    // before they can use the app, after which this becomes false. Defaults to
    // false so the seeded Root and any pre-existing accounts are unaffected.
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    // Password-reset state. We store ONLY the SHA-256 hash of the one-time token
    // (never the plaintext) plus its expiry. Both are `select: false` so they are
    // never returned by ordinary queries or serialised to the client. Cleared
    // immediately after a successful reset, making the token single-use.
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash the password whenever it is set/changed — keeps hashing in one place.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.bcrypt.saltRounds);
  return next();
});

/** Compare a plaintext candidate against the stored hash. */
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = model('User', userSchema);

module.exports = User;
