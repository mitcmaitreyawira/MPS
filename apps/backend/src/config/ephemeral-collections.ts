/**
 * Configuration for ephemeral collections with TTL indexes.
 * These collections are designed to automatically expire data after a specified time.
 * 
 * This centralizes TTL management and makes it clear which collections are temporary.
 */

export interface EphemeralCollectionConfig {
  name: string;
  ttlSeconds: number;
  description: string;
  indexField?: string; // Field to create TTL index on, defaults to 'createdAt'
}

/**
 * Ephemeral collections configuration
 * All collections listed here will have TTL indexes automatically created
 */
export const EPHEMERAL_COLLECTIONS: EphemeralCollectionConfig[] = [
  {
    name: 'performancemetrics',
    ttlSeconds: 30 * 24 * 60 * 60, // 30 days
    description: 'Performance metrics and monitoring data',
    indexField: 'createdAt'
  },
  {
    name: 'requesttimers',
    ttlSeconds: 24 * 60 * 60, // 24 hours
    description: 'Request timing data for performance tracking',
    indexField: 'createdAt'
  },
  {
    name: 'syncoperations',
    ttlSeconds: 7 * 24 * 60 * 60, // 7 days
    description: 'Data synchronization operations log',
    indexField: 'createdAt'
  },
  {
    name: 'instancelocks',
    ttlSeconds: 0, // Immediate expiration based on expiresAt field
    description: 'Development instance locks for single backend enforcement',
    indexField: 'expiresAt'
  }
];

/**
 * Get TTL configuration for a specific collection
 */
export function getCollectionTTL(collectionName: string): EphemeralCollectionConfig | undefined {
  return EPHEMERAL_COLLECTIONS.find(config => config.name === collectionName);
}

/**
 * Check if a collection is configured as ephemeral
 */
export function isEphemeralCollection(collectionName: string): boolean {
  return EPHEMERAL_COLLECTIONS.some(config => config.name === collectionName);
}

/**
 * Get all ephemeral collection names
 */
export function getEphemeralCollectionNames(): string[] {
  return EPHEMERAL_COLLECTIONS.map(config => config.name);
}