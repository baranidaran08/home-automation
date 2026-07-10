'use strict';

const { Schema, model } = require('mongoose');

/** Atomic named counters (used for sequential quotation numbers). */
const counterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const Counter = model('Counter', counterSchema);

/**
 * Atomically increment and return the next value for a named sequence.
 * Concurrency-safe via findOneAndUpdate($inc) with upsert.
 */
const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = { Counter, getNextSequence };
