// Enhanced Database Consolidation Script
// Merges mps_db and mps_db_dev into mps_db_unified with improved user handling

print('=== Enhanced Database Consolidation Started ===');

const sourceDb1 = db.getSiblingDB('mps_db');
const sourceDb2 = db.getSiblingDB('mps_db_dev');
const targetDb = db.getSiblingDB('mps_db_unified');

// Get all collection names from both source databases
const collections1 = sourceDb1.getCollectionNames();
const collections2 = sourceDb2.getCollectionNames();
const allCollections = [...new Set([...collections1, ...collections2])];

print(`Collections to process: ${allCollections.join(', ')}`);

let migrationSummary = {
    collections: {},
    totalDocuments: 0,
    duplicatesHandled: 0,
    errors: []
};

// Function to generate a unique identifier for users
function getUserKey(user) {
    if (user.username) return `username:${user.username}`;
    if (user.email) return `email:${user.email}`;
    return `id:${user._id.toString()}`;
}

// Process each collection
allCollections.forEach(collectionName => {
    print(`\n--- Processing collection: ${collectionName} ---`);
    
    let collection1Docs = [];
    let collection2Docs = [];
    
    // Get documents from first database
    if (collections1.includes(collectionName)) {
        collection1Docs = sourceDb1[collectionName].find({}).toArray();
        print(`Found ${collection1Docs.length} documents in mps_db.${collectionName}`);
    }
    
    // Get documents from second database
    if (collections2.includes(collectionName)) {
        collection2Docs = sourceDb2[collectionName].find({}).toArray();
        print(`Found ${collection2Docs.length} documents in mps_db_dev.${collectionName}`);
    }
    
    let insertedCount = 0;
    let duplicatesCount = 0;
    
    if (collectionName === 'users') {
        // Special handling for users collection to avoid duplicates
        const userMap = new Map();
        
        // Process users from both databases
        [...collection1Docs, ...collection2Docs].forEach(user => {
            const userKey = getUserKey(user);
            
            if (!userMap.has(userKey)) {
                // Generate new ObjectId for unified database
                user._id = new ObjectId();
                userMap.set(userKey, user);
            } else {
                duplicatesCount++;
                print(`Duplicate user found: ${userKey}`);
                
                // Merge user data if needed (prefer non-empty values)
                const existingUser = userMap.get(userKey);
                Object.keys(user).forEach(key => {
                    if (key !== '_id' && user[key] && !existingUser[key]) {
                        existingUser[key] = user[key];
                    }
                });
            }
        });
        
        // Insert all unique users
        const uniqueUsers = Array.from(userMap.values());
        if (uniqueUsers.length > 0) {
            try {
                targetDb[collectionName].insertMany(uniqueUsers, { ordered: false });
                insertedCount = uniqueUsers.length;
                print(`Inserted ${insertedCount} unique users`);
            } catch (e) {
                migrationSummary.errors.push(`Error inserting users: ${e.message}`);
                print(`Error inserting users: ${e.message}`);
            }
        }
    } else {
        // Handle other collections
        const allDocs = [...collection1Docs, ...collection2Docs];
        
        if (allDocs.length > 0) {
            // Generate new ObjectIds for all documents to avoid conflicts
            allDocs.forEach(doc => {
                doc._id = new ObjectId();
            });
            
            try {
                targetDb[collectionName].insertMany(allDocs, { ordered: false });
                insertedCount = allDocs.length;
                print(`Inserted ${insertedCount} documents`);
            } catch (e) {
                migrationSummary.errors.push(`Error inserting ${collectionName}: ${e.message}`);
                print(`Error inserting ${collectionName}: ${e.message}`);
            }
        }
    }
    
    migrationSummary.collections[collectionName] = {
        source1Count: collection1Docs.length,
        source2Count: collection2Docs.length,
        insertedCount: insertedCount,
        duplicatesCount: duplicatesCount
    };
    
    migrationSummary.totalDocuments += insertedCount;
    migrationSummary.duplicatesHandled += duplicatesCount;
});

// Create migration metadata
const migrationMetadata = {
    migratedAt: new Date(),
    sourceDatabase1: 'mps_db',
    sourceDatabase2: 'mps_db_dev',
    targetDatabase: 'mps_db_unified',
    summary: migrationSummary,
    version: '2.0'
};

targetDb.migration_log.insertOne(migrationMetadata);

print('\n=== Enhanced Migration Summary ===');
print(`Total collections processed: ${Object.keys(migrationSummary.collections).length}`);
print(`Total documents migrated: ${migrationSummary.totalDocuments}`);
print(`Total duplicates handled: ${migrationSummary.duplicatesHandled}`);

if (migrationSummary.errors.length > 0) {
    print('\nErrors encountered:');
    migrationSummary.errors.forEach(error => print(`- ${error}`));
}

print('\nCollection details:');
Object.entries(migrationSummary.collections).forEach(([name, stats]) => {
    print(`${name}: ${stats.source1Count} + ${stats.source2Count} -> ${stats.insertedCount} (${stats.duplicatesCount} duplicates)`);
});

// Final verification
print('\n--- Final Verification ---');
const finalUserCount = targetDb.users.countDocuments({});
const finalCollectionCount = targetDb.getCollectionNames().length;

print(`Final unified database stats:`);
print(`- Collections: ${finalCollectionCount}`);
print(`- Users: ${finalUserCount}`);
print(`- Total documents: ${migrationSummary.totalDocuments}`);

print('\n=== Enhanced Database Consolidation Completed ===');
print('\nNext steps:');
print('1. Update application configuration to use mps_db_unified');
print('2. Test application functionality');
print('3. Verify user authentication works correctly');
print('4. Once confirmed working, decommission old databases');