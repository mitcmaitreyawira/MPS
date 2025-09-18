#!/usr/bin/env bash
set -euo pipefail

# MPS Automated Backup Setup Script
# Sets up automated daily backups and cleanup procedures

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/scripts/backup.sh"
CRONTAB_FILE="/tmp/mps_crontab_$$"

echo "🚀 Setting up automated backups for MPS..."

# Verify backup script exists and is executable
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

if [ ! -x "$BACKUP_SCRIPT" ]; then
    echo "📝 Making backup script executable..."
    chmod +x "$BACKUP_SCRIPT"
fi

# Create backup directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/backups"

# Test backup script
echo "🧪 Testing backup script..."
if "$BACKUP_SCRIPT"; then
    echo "✅ Backup script test successful"
else
    echo "❌ Backup script test failed"
    exit 1
fi

# Create cron job configuration
echo "📅 Setting up cron jobs..."

# Get current crontab (if any)
crontab -l 2>/dev/null > "$CRONTAB_FILE" || touch "$CRONTAB_FILE"

# Remove any existing MPS backup jobs
grep -v "MPS Backup" "$CRONTAB_FILE" > "${CRONTAB_FILE}.tmp" || touch "${CRONTAB_FILE}.tmp"
mv "${CRONTAB_FILE}.tmp" "$CRONTAB_FILE"

# Add new MPS backup jobs
cat >> "$CRONTAB_FILE" << EOF

# MPS Backup Jobs - Automated Data Persistence
# Daily backup at 2:00 AM
0 2 * * * cd "$SCRIPT_DIR" && "$BACKUP_SCRIPT" >> "$SCRIPT_DIR/logs/backup.log" 2>&1

# Weekly cleanup of old backups (keep last 30 days)
0 3 * * 0 find "$SCRIPT_DIR/backups" -name "mps_backup_*.tar.gz" -mtime +30 -delete >> "$SCRIPT_DIR/logs/cleanup.log" 2>&1

# Monthly backup verification
0 4 1 * * cd "$SCRIPT_DIR" && node verify-data-persistence.js >> "$SCRIPT_DIR/logs/verification.log" 2>&1
EOF

# Install the new crontab
if crontab "$CRONTAB_FILE"; then
    echo "✅ Cron jobs installed successfully"
else
    echo "❌ Failed to install cron jobs"
    rm -f "$CRONTAB_FILE"
    exit 1
fi

# Create log directory
mkdir -p "$SCRIPT_DIR/logs"

# Clean up temporary file
rm -f "$CRONTAB_FILE"

# Display current cron jobs
echo "\n📋 Current MPS cron jobs:"
crontab -l | grep -A 10 -B 2 "MPS Backup" || echo "No MPS backup jobs found"

echo "\n🎉 Automated backup setup completed!"
echo "\n📊 Summary:"
echo "  ✅ Daily backups scheduled for 2:00 AM"
echo "  ✅ Weekly cleanup of old backups (30+ days)"
echo "  ✅ Monthly data persistence verification"
echo "  ✅ Logs will be stored in: $SCRIPT_DIR/logs/"
echo "\n📝 Manual commands:"
echo "  - Run backup now: $BACKUP_SCRIPT"
echo "  - Verify persistence: node verify-data-persistence.js"
echo "  - View cron jobs: crontab -l"
echo "  - View backup logs: tail -f $SCRIPT_DIR/logs/backup.log"

echo "\n✨ Data persistence is now fully automated!"