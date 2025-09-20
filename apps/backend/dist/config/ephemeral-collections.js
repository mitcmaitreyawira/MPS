"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPHEMERAL_COLLECTIONS = void 0;
exports.getCollectionTTL = getCollectionTTL;
exports.isEphemeralCollection = isEphemeralCollection;
exports.getEphemeralCollectionNames = getEphemeralCollectionNames;
exports.EPHEMERAL_COLLECTIONS = [
    {
        name: 'performancemetrics',
        ttlSeconds: 30 * 24 * 60 * 60,
        description: 'Performance metrics and monitoring data',
        indexField: 'createdAt'
    },
    {
        name: 'requesttimers',
        ttlSeconds: 24 * 60 * 60,
        description: 'Request timing data for performance tracking',
        indexField: 'createdAt'
    },
    {
        name: 'syncoperations',
        ttlSeconds: 7 * 24 * 60 * 60,
        description: 'Data synchronization operations log',
        indexField: 'createdAt'
    },
    {
        name: 'instancelocks',
        ttlSeconds: 0,
        description: 'Development instance locks for single backend enforcement',
        indexField: 'expiresAt'
    }
];
function getCollectionTTL(collectionName) {
    return exports.EPHEMERAL_COLLECTIONS.find(config => config.name === collectionName);
}
function isEphemeralCollection(collectionName) {
    return exports.EPHEMERAL_COLLECTIONS.some(config => config.name === collectionName);
}
function getEphemeralCollectionNames() {
    return exports.EPHEMERAL_COLLECTIONS.map(config => config.name);
}
//# sourceMappingURL=ephemeral-collections.js.map