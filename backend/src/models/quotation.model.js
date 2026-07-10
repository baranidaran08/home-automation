'use strict';

const { Schema, model } = require('mongoose');

const QUOTATION_STATUS = { DRAFT: 'draft', GENERATED: 'generated', FAILED: 'failed' };
const QUOTATION_STATUS_VALUES = Object.values(QUOTATION_STATUS);

/** A single line item — price is always taken from the product (admin can't edit). */
const itemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Per-category totals: each selected category (service) carries its own charge.
const categoryTotalSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryName: { type: String, default: '' },
    productTotal: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    serviceTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const pdfSchema = new Schema(
  { publicId: { type: String }, secureUrl: { type: String } },
  { _id: false }
);

/**
 * Quotation — customer + selected categories/products with server-computed
 * totals, plus the generated (merged) PDF once produced.
 */
const quotationSchema = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true, index: true },
    quotationDate: { type: Date, default: Date.now },

    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    projectName: { type: String, trim: true, default: '' },
    projectLocation: { type: String, trim: true, default: '' },

    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    items: { type: [itemSchema], default: [] },
    categoryTotals: { type: [categoryTotalSchema], default: [] },
    grandTotal: { type: Number, default: 0 },

    // Overall totals (sums across every category's per-category totals).
    // grandTotal === serviceTotal === sum of each category's serviceTotal.
    productTotal: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    serviceTotal: { type: Number, default: 0 },

    pdf: { type: pdfSchema, default: undefined },
    status: { type: String, enum: QUOTATION_STATUS_VALUES, default: QUOTATION_STATUS.DRAFT },
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

const Quotation = model('Quotation', quotationSchema);

module.exports = { Quotation, QUOTATION_STATUS, QUOTATION_STATUS_VALUES };
