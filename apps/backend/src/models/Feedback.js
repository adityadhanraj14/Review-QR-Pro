import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedbackText: { type: String, required: true, trim: true, maxlength: 2000 },
    contact: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

feedbackSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
