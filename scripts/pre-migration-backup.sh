#!/bin/bash

# Pre-Migration Backup Script
# Creates backups of both databases before consolidation

set -e

echo "=== Pre-Migration Database Backup Started ==="

# Configuration
BACKUP_DIR="./backups/pre-migration-$(date +%Y%m%d_%H%M%S)"
CONTAINER_NAME="mps-mongodb-dev"
MONGO_USER="admin"
MONGO_PASS="password"
MONGO_AUTH_DB="admin"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Function to backup a database
backup_database() {
    local db_name=$1
    echo "\n--- Backing up database: $db_name ---"
    
    docker exec "$CONTAINER_NAME" mongodump \
        --username="$MONGO_USER" \
        --password="$MONGO_PASS" \
        --authenticationDatabase="$MONGO_AUTH_DB" \
        --db="$db_name" \
        --out="/tmp/backup_$db_name"
    
    # Copy backup from container to host
    docker cp "$CONTAINER_NAME:/tmp/backup_$db_name" "$BACKUP_DIR/"
    
    # Clean up container backup
    docker exec "$CONTAINER_NAME" rm -rf "/tmp/backup_$db_name"
    
    echo "Backup completed for $db_name"
}

# Check if MongoDB container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: MongoDB container '$CONTAINER_NAME' is not running"
    exit 1
fi

# Backup both databases
backup_database "mps_db"
backup_database "mps_db_dev"

# Create metadata file
cat > "$BACKUP_DIR/backup_metadata.txt" << EOF
Backup Created: $(date)
MongoDB Container: $CONTAINER_NAME
Databases Backed Up:
- mps_db
- mps_db_dev

Purpose: Pre-migration backup before database consolidation
EOF

# Verify backups
echo "\n--- Backup Verification ---"
for db in mps_db mps_db_dev; do
    if [ -d "$BACKUP_DIR/backup_$db/$db" ]; then
        collection_count=$(find "$BACKUP_DIR/backup_$db/$db" -name "*.bson" | wc -l)
        echo "$db: $collection_count collections backed up"
    else
        echo "Warning: Backup for $db not found!"
    fi
done

echo "\n=== Pre-Migration Backup Completed ==="
echo "Backup location: $BACKUP_DIR"
echo "\nTo restore a database if needed:"
echo "docker exec $CONTAINER_NAME mongorestore --username=$MONGO_USER --password=$MONGO_PASS --authenticationDatabase=$MONGO_AUTH_DB --db=<db_name> /path/to/backup"