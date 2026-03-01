const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixAcademicYearIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admission_mgmt');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('academicyears');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old year_1 index if it exists
    try {
      await collection.dropIndex('year_1');
      console.log('\n✅ Dropped old "year_1" index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  Index "year_1" does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // Create the new compound unique index
    await collection.createIndex(
      { institution: 1, year: 1 },
      { unique: true, name: 'institution_1_year_1' }
    );
    console.log('✅ Created new compound index "institution_1_year_1"');

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\n📋 Updated indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Index migration completed successfully!');
    console.log('You can now create academic years for different institutions with the same year number.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixAcademicYearIndex();
