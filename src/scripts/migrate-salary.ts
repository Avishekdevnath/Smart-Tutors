// Run with: npx ts-node src/scripts/migrate-salary.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrateSalary() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const collection = db.collection('tuitions');

  const tuitions = await collection.find({ salary: { $type: 'string' } }).toArray();
  console.log(`Found ${tuitions.length} tuitions with string salary`);

  for (const t of tuitions) {
    const salaryStr = String(t.salary || '').trim();
    let min: number | null = null;
    let max: number | null = null;

    if (salaryStr.includes('-')) {
      const parts = salaryStr.split('-').map(s => parseInt(s.replace(/[^\d]/g, '')));
      min = parts[0] || null;
      max = parts[1] || parts[0] || null;
    } else {
      const num = parseInt(salaryStr.replace(/[^\d]/g, ''));
      if (!isNaN(num)) { min = num; max = num; }
    }

    await collection.updateOne(
      { _id: t._id },
      { $set: { salary: { min, max } } }
    );
  }

  console.log('Salary migration complete');
  await mongoose.disconnect();
}

migrateSalary().catch(console.error);
