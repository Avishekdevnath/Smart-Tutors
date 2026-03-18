// Run with: npx ts-node src/scripts/migrate-location-data.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrateLocationData() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const tuitions = db.collection('tuitions');
  const locations = db.collection('locations');

  const allTuitions = await tuitions.find({
    location: { $exists: true, $ne: '' },
    locationData: { $exists: false }
  }).toArray();

  console.log(`Found ${allTuitions.length} tuitions to backfill`);

  const allLocations = await locations.find({}).toArray();

  for (const t of allTuitions) {
    const locStr = String(t.location || '').toLowerCase();
    const parts = locStr.split(/[,\s]+/).filter(Boolean);

    let bestMatch: typeof allLocations[0] | null = null;
    let bestScore = 0;

    for (const loc of allLocations) {
      let score = 0;
      const area = (loc.area || '').toLowerCase();
      const district = (loc.district || '').toLowerCase();
      const division = (loc.division || '').toLowerCase();

      for (const part of parts) {
        if (area.includes(part) || part.includes(area)) score += 3;
        if (district.includes(part) || part.includes(district)) score += 2;
        if (division.includes(part) || part.includes(division)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = loc;
      }
    }

    if (bestMatch && bestScore >= 2) {
      await tuitions.updateOne(
        { _id: t._id },
        {
          $set: {
            locationData: {
              division: bestMatch.division,
              district: bestMatch.district,
              area: bestMatch.area,
              subarea: bestMatch.subarea || '',
              locationRef: bestMatch._id
            }
          }
        }
      );
    }
  }

  console.log('Location data backfill complete');
  await mongoose.disconnect();
}

migrateLocationData().catch(console.error);
