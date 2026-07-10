'use strict';

const { Schema, model } = require('mongoose');

/**
 * Category — a Home Automation field (e.g. Lighting, Security, Climate Control).
 * A category simply represents a field; it has no active/inactive status.
 * Products and Templates will reference categories, so names/slugs are unique
 * and indexed for fast lookups.
 */
const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name must be at most 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Case-insensitive search on name is done via regex in the service; the unique
// index on categoryName + the unique slug index guard against duplicates.
const Category = model('Category', categorySchema);

module.exports = Category;
