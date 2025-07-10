const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tutors';

// Facebook Group Collection Schema
const FacebookGroupSchema = new mongoose.Schema({
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

const FacebookGroupCollectionSchema = new mongoose.Schema({
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
});

// Create slug from collection name
FacebookGroupCollectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.slug && this.collectionName) {
    this.slug = this.collectionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const FacebookGroupCollection = mongoose.model('FacebookGroupCollection', FacebookGroupCollectionSchema);

async function importFacebookGroups() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read the sample data file
    const sampleDataPath = path.join(__dirname, '../data_sample/smart.fbgroupcollections.json');
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

    console.log(`Found ${sampleData.length} collections to import`);

    // Clear existing collections
    await FacebookGroupCollection.deleteMany({});
    console.log('Cleared existing Facebook group collections');

    // Import each collection
    for (const collectionData of sampleData) {
      const collection = new FacebookGroupCollection({
        collectionName: collectionData.collectionName,
        slug: collectionData.slug,
        groups: collectionData.groups.map(group => ({
          name: group.name,
          link: group.link,
          memberCount: group.memberCount,
          locations: group.locations || []
        }))
      });

      await collection.save();
      console.log(`Imported collection: ${collectionData.collectionName} with ${collectionData.groups.length} groups`);
    }

    console.log('Facebook group collections imported successfully!');
    
    // Display summary
    const totalCollections = await FacebookGroupCollection.countDocuments();
    const totalGroups = await FacebookGroupCollection.aggregate([
      { $unwind: '$groups' },
      { $count: 'total' }
    ]);
    
    console.log(`\nSummary:`);
    console.log(`- Total collections: ${totalCollections}`);
    console.log(`- Total groups: ${totalGroups[0]?.total || 0}`);

  } catch (error) {
    console.error('Error importing Facebook groups:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importFacebookGroups();
}

module.exports = { importFacebookGroups }; 