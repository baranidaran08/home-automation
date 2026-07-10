'use strict';

const { Schema, model } = require('mongoose');

/** Cloudinary reference to the stored Word (.docx) template file. */
const templateFileSchema = new Schema(
  {
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    originalFileName: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * Template — a Microsoft Word (.docx) quotation template that belongs to
 * exactly ONE Category, used later to generate customer quotations.
 *
 * Business rule: one category = one template. The `unique` index on `category`
 * enforces this at the database level; the service also checks it to return a
 * friendly 409 instead of a raw duplicate-key error.
 */
const templateSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      unique: true,
    },
    templateName: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [150, 'Template name must be at most 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    templateFile: { type: templateFileSchema, required: true },
    // Placeholders detected in the uploaded .docx (bare names, no braces).
    placeholders: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Template = model('Template', templateSchema);

module.exports = Template;
