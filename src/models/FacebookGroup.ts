import mongoose, { Schema, Document } from 'mongoose';

export interface IFacebookGroup {
  name: string;
  link: string;
  memberCount: number;
  locations: string[];
}

export interface IFacebookGroupCollection extends Document {
  collectionName: string;
  slug: string;
  groups: IFacebookGroup[];
  createdAt: Date;
  updatedAt: Date;
}

const FacebookGroupSchema = new Schema<IFacebookGroup>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  memberCount: {
    type: Number,
    required: true,
    default: 0
  },
  locations: [{
    type: String,
    trim: true
  }]
});

const FacebookGroupCollectionSchema = new Schema<IFacebookGroupCollection>({
  collectionName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  groups: [FacebookGroupSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'fbgroupcollections' });

// Update the updatedAt field before saving
FacebookGroupCollectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create slug from collection name if not provided
FacebookGroupCollectionSchema.pre('save', function(next) {
  if (!this.slug && this.collectionName) {
    this.slug = this.collectionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const FacebookGroupCollection = mongoose.models.FacebookGroupCollection || 
  mongoose.model<IFacebookGroupCollection>('FacebookGroupCollection', FacebookGroupCollectionSchema); 