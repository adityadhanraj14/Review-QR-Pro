import mongoose from 'mongoose';

const placeIdRegex = /^[A-Za-z0-9_-]{10,}$/;

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    placeId: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(v) {
          return placeIdRegex.test(v);
        },
        message: 'Invalid Google Place ID format',
      },
    },
    location: {
      address: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
    },
    serverName: { type: String, default: '', trim: true, maxlength: 80 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrSlug: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Business', businessSchema);
