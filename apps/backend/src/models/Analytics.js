import mongoose from 'mongoose';
import { AI_SUGGESTION_COUNT } from '../constants/aiReviews.js';

const analyticsTypes = [
  'scan',
  'rating_selected',
  'ai_generate',
  'review_selected',
  'google_redirect',
  'internal_feedback',
];

const analyticsSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, enum: analyticsTypes, required: true, index: true },
    rating: { type: Number, min: 1, max: 5 },
    reviewIndex: { type: Number, min: 0, max: AI_SUGGESTION_COUNT - 1 },
    source: { type: String, enum: ['ai', 'custom'] },
    sessionId: { type: String, default: '', index: true },
  },
  { timestamps: true }
);

analyticsSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);
