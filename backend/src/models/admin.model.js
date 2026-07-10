'use strict';

const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { ROLES, ROLE_VALUES } = require('../constants/roles');

/**
 * Admin account. The system has exactly one admin (seeded, no self-service
 * registration). Password is stored hashed and is never serialised.
 */
const adminSchema = new Schema(
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
      // Exclude from query results by default; explicitly `.select('+password')`
      // when authentication needs to verify it.
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.ADMIN,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
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
adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.bcrypt.saltRounds);
  return next();
});

/** Compare a plaintext candidate against the stored hash. */
adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Admin = model('Admin', adminSchema);

module.exports = Admin;
