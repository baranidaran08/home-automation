'use strict';

const { Schema, model } = require('mongoose');
const { ENTITY_STATUS, ENTITY_STATUS_VALUES } = require('../constants/status');

/** Cloudinary image reference stored on the product. */
const imageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Product (inventory item). Belongs to exactly one Category. Used later by
 * Quotations, Inventory and Template detection, so it is indexed for search
 * and filtering and keeps Cloudinary image references.
 */
const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name must be at most 150 characters'],
    },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    brand: { type: String, trim: true, default: '', index: true, maxlength: 100 },
    modelNumber: { type: String, trim: true, default: '', maxlength: 100 },
    description: { type: String, trim: true, default: '', maxlength: 2000 },
    specifications: { type: String, trim: true, default: '', maxlength: 4000 },
    warranty: { type: String, trim: true, default: '', maxlength: 200 },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    images: { type: [imageSchema], default: [] },
    status: {
      type: String,
      enum: ENTITY_STATUS_VALUES,
      default: ENTITY_STATUS.ACTIVE,
      index: true,
    },
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

// Compound index to support the common "list a category's products" query.
productSchema.index({ category: 1, status: 1 });

const Product = model('Product', productSchema);

module.exports = Product;
