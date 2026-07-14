'use strict';

const { Schema, model } = require('mongoose');

/**
 * Permission — one atomic capability, e.g. `products:create`. Permissions are
 * SEEDED from the static PERMISSION_MATRIX (constants/permissions.js), never
 * created by users. Roles reference these documents to grant access.
 */
const permissionSchema = new Schema(
  {
    // Canonical `<module>:<action>` identifier — the value stored on the JWT
    // and checked by the authorize() middleware.
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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

const Permission = model('Permission', permissionSchema);

module.exports = Permission;
