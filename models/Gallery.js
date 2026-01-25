import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
