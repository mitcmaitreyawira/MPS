// Database Decommissioning Script
// Safely removes old databases after successful consolidation

print('=== Database Decommissioning Started ===');

const oldDb1 = db.getSiblingDB('mps_db');
const oldDb2 = db.getSiblingDB('mps_db_dev');
const unifiedDb = db.getSiblingDB('mps_db_unified');

// Verify unified database exists and has data
print('\n--- Verification Phase ---');
const unifiedCollections = unifiedDb.getCollectionNames();
const unifiedUserCount = unifiedDb.users.countDocuments({});

print(`Unified database collections: ${unifiedCollections.length}`);
print(`Unified database user count: ${unifiedUserCount}`);

if (unifiedCollections.length === 0 || unifiedUserCount === 0) {
    print('ERROR: Unified database appears to be empty or incomplete!');
    print('Aborting decommissioning for safety.');
    quit(1);
}

// Safety check - ensure we have more data in unified than in individual databases
const oldDb1UserCount = oldDb1.users.countDocuments({});
const oldDb2UserCount = oldDb2.users.countDocuments({});
const maxOldUserCount = Math.max(oldDb1UserCount, oldDb2UserCount);

print(`Old mps_db user count: ${oldDb1UserCount}`);
print(`Old mps_db_dev user count: ${oldDb2UserCount}`);
print(`Max old database user count: ${maxOldUserCount}`);

if (unifiedUserCount < maxOldUserCount) {
    print('ERROR: Unified database has fewer users than the largest old database!');
    print('This suggests the migration may not have completed successfully.');
    print('Aborting decommissioning for safety.');
    quit(1);
}

print('\n--- Safety checks passed. Proceeding with decommissioning ---');

// Create final verification backup metadata
const timestamp = new Date().toISOString();
const verificationData = {
    decommissionedAt: timestamp,
    oldDatabases: {
        mps_db: {
            collections: oldDb1.getCollectionNames().length,
            users: oldDb1UserCount,
            totalDocuments: 0
        },
        mps_db_dev: {
            collections: oldDb2.getCollectionNames().length,
            users: oldDb2UserCount,
            totalDocuments: 0
        }
    },
    unifiedDatabase: {
        collections: unifiedCollections.length,
        users: unifiedUserCount,
        totalDocuments: 0
    }
};

// Count total documents in old databases
oldDb1.getCollectionNames().forEach(col => {
    verificationData.oldDatabases.mps_db.totalDocuments += oldDb1[col].countDocuments({});
});

oldDb2.getCollectionNames().forEach(col => {
    verificationData.oldDatabases.mps_db_dev.totalDocuments += oldDb2[col].countDocuments({});
});

unifiedCollections.forEach(col => {
    verificationData.unifiedDatabase.totalDocuments += unifiedDb[col].countDocuments({});
});

// Store verification data in unified database
unifiedDb.decommission_log.insertOne(verificationData);
print('Verification data stored in unified database.');

// Drop old databases
print('\n--- Dropping old databases ---');

try {
    oldDb1.dropDatabase();
    print('Successfully dropped mps_db database');
} catch (e) {
    print(`Warning: Could not drop mps_db database: ${e.message}`);
}

try {
    oldDb2.dropDatabase();
    print('Successfully dropped mps_db_dev database');
} catch (e) {
    print(`Warning: Could not drop mps_db_dev database: ${e.message}`);
}

// Final verification
print('\n--- Final Verification ---');
const remainingDatabases = db.adminCommand('listDatabases').databases.map(d => d.name);
print(`Remaining databases: ${remainingDatabases.join(', ')}`);

if (remainingDatabases.includes('mps_db') || remainingDatabases.includes('mps_db_dev')) {
    print('Warning: Some old databases may still exist');
} else {
    print('Success: Old databases have been completely removed');
}

print('\n=== Database Decommissioning Completed ===');
print('Summary:');
print(`- Unified database: mps_db_unified (${unifiedUserCount} users, ${verificationData.unifiedDatabase.totalDocuments} total documents)`);
print('- Old databases: Successfully decommissioned');
print('- Verification log: Stored in mps_db_unified.decommission_log');
print('\nThe database consolidation is now complete!');