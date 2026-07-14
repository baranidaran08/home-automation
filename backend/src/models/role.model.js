'use strict';

const { Schema, model } = require('mongoose');

/**
 * Role — a named set of permissions assigned to users. The `permissions` array
 * IS the role→permission mapping (many-to-many via refs). Two flags govern
 * behaviour:
 *   - isSuperAdmin: wildcard bypass — the middleware grants every permission
 *     regardless of the array (auto-covers future modules).
 *   - isSystem: seeded default role; the API refuses to rename or delete it.
 */
const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true,
      maxlength: [60, 'Role name must be at most 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Description must be at most 300 characters'],
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isSystem: {
      type: Boolean,
      default: false,
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

const Role = model('Role', roleSchema);

module.exports = Role;
