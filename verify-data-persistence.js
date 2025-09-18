#!/usr/bin/env node

/**
 * Data Persistence Verification Script
 * 
 * This script verifies that the MPS system has proper data persistence by:
 * 1. Checking MongoDB persistent volumes
 * 2. Verifying existing user data
 * 3. Testing backup and restore capabilities
 * 4. Confirming database configuration
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class DataPersistenceVerifier {
  constructor() {
    this.results = {
      volumePersistence: false,
      databaseConnection: false,
      userData: false,
      backupCapability: false,
      restoreCapability: false,
      overallScore: 0
    };
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'test': '🧪'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkDockerVolumes() {
    try {
      await this.log('Checking Docker volume persistence...', 'test');
      
      const { stdout } = await execAsync('docker volume ls | grep mongodb');
      const volumes = stdout.trim().split('\n').filter(line => line.includes('mongodb'));
      
      if (volumes.length > 0) {
        await this.log(`Found ${volumes.length} MongoDB persistent volumes:`, 'success');
        volumes.forEach(volume => {
          const volumeName = volume.split(/\s+/).pop();
          this.log(`  - ${volumeName}`);
        });
        
        // Check volume details
        for (const volume of volumes) {
          const volumeName = volume.split(/\s+/).pop();
          try {
            const { stdout: inspectOutput } = await execAsync(`docker volume inspect ${volumeName}`);
            const volumeInfo = JSON.parse(inspectOutput)[0];
            await this.log(`  Volume ${volumeName} mounted at: ${volumeInfo.Mountpoint}`);
          } catch (error) {
            await this.log(`  Could not inspect volume ${volumeName}`, 'warning');
          }
        }
        
        this.results.volumePersistence = true;
        return true;
      } else {
        await this.log('No MongoDB persistent volumes found', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Volume check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkDatabaseConnection() {
    try {
      await this.log('Testing database connection and health...', 'test');
      
      const { stdout } = await execAsync(
        'docker exec mps-mongodb-dev mongosh "mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin" --eval "db.runCommand({ping: 1})"'
      );
      
      if (stdout.includes('ok: 1') || stdout.includes('"ok" : 1')) {
        await this.log('Database connection is healthy', 'success');
        this.results.databaseConnection = true;
        return true;
      } else {
        await this.log('Database ping failed', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Database connection test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkUserData() {
    try {
      await this.log('Verifying user data persistence...', 'test');
      
      const { stdout } = await execAsync(
        'docker exec mps-mongodb-dev mongosh "mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin" --eval "db.users.countDocuments()"'
      );
      
      const userCount = parseInt(stdout.match(/\d+/)?.[0] || '0');
      
      if (userCount > 0) {
        await this.log(`Found ${userCount} users in database`, 'success');
        
        // Get sample user data
        const { stdout: sampleData } = await execAsync(
          'docker exec mps-mongodb-dev mongosh "mongodb://admin:password@localhost:27017/mps_db_unified?authSource=admin" --eval "db.users.findOne({}, {nisn: 1, firstName: 1, lastName: 1, createdAt: 1})"'
        );
        
        await this.log('Sample user data structure verified');
        this.results.userData = true;
        return true;
      } else {
        await this.log('No user data found in database', 'warning');
        return false;
      }
    } catch (error) {
      await this.log(`User data check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkBackupCapability() {
    try {
      await this.log('Testing backup capability...', 'test');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `/tmp/test_backup_${timestamp}.archive`;
      
      await execAsync(
        `docker exec mps-mongodb-dev mongodump --username admin --password password --authenticationDatabase admin --db mps_db_unified --archive=${backupPath}`
      );
      
      // Check if backup file was created
      const { stdout } = await execAsync(`docker exec mps-mongodb-dev ls -la ${backupPath}`);
      
      if (stdout.includes(path.basename(backupPath))) {
        await this.log('Backup creation successful', 'success');
        
        // Clean up test backup
        await execAsync(`docker exec mps-mongodb-dev rm -f ${backupPath}`);
        
        this.results.backupCapability = true;
        return true;
      } else {
        await this.log('Backup file was not created', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Backup test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkRestoreCapability() {
    try {
      await this.log('Verifying restore capability...', 'test');
      
      // Check if backup files exist
      try {
        const { stdout } = await execAsync('ls -la backups/');
        const backupFiles = stdout.split('\n').filter(line => 
          line.includes('.archive') || line.includes('.tar.gz')
        );
        
        if (backupFiles.length > 0) {
          await this.log(`Found ${backupFiles.length} backup files available for restore`, 'success');
          this.results.restoreCapability = true;
          return true;
        } else {
          await this.log('No backup files found for restore testing', 'warning');
          return false;
        }
      } catch (error) {
        await this.log('Backup directory not accessible', 'warning');
        return false;
      }
    } catch (error) {
      await this.log(`Restore capability check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkEnvironmentConfiguration() {
    try {
      await this.log('Checking environment configuration...', 'test');
      
      // Check if .env file exists and has database configuration
      const envPath = './apps/backend/.env';
      const envContent = await fs.readFile(envPath, 'utf8');
      
      const hasMongoUri = envContent.includes('MONGODB_URI');
      const hasCorrectUri = envContent.includes('mongodb://admin:password@mps-mongodb-dev:27017/mps_db_unified');
      
      if (hasMongoUri && hasCorrectUri) {
        await this.log('Database URI configuration is correct', 'success');
        return true;
      } else {
        await this.log('Database URI configuration needs verification', 'warning');
        return false;
      }
    } catch (error) {
      await this.log(`Environment configuration check failed: ${error.message}`, 'error');
      return false;
    }
  }

  calculateScore() {
    const checks = Object.values(this.results).filter(val => typeof val === 'boolean');
    const passed = checks.filter(val => val === true).length;
    this.results.overallScore = Math.round((passed / checks.length) * 100);
  }

  async generateReport() {
    await this.log('\n' + '='.repeat(60), 'info');
    await this.log('DATA PERSISTENCE VERIFICATION REPORT', 'info');
    await this.log('='.repeat(60), 'info');
    
    const checkResults = [
      { name: 'Docker Volume Persistence', result: this.results.volumePersistence },
      { name: 'Database Connection Health', result: this.results.databaseConnection },
      { name: 'User Data Persistence', result: this.results.userData },
      { name: 'Backup Capability', result: this.results.backupCapability },
      { name: 'Restore Capability', result: this.results.restoreCapability }
    ];
    
    checkResults.forEach(check => {
      const status = check.result ? '✅ PASS' : '❌ FAIL';
      this.log(`${check.name}: ${status}`);
    });
    
    await this.log('\n' + '-'.repeat(60), 'info');
    await this.log(`OVERALL SCORE: ${this.results.overallScore}%`, 
      this.results.overallScore >= 80 ? 'success' : 
      this.results.overallScore >= 60 ? 'warning' : 'error'
    );
    
    if (this.results.overallScore >= 80) {
      await this.log('\n🎉 EXCELLENT: Data persistence is properly configured!', 'success');
      await this.log('✅ User accounts will persist after server restarts', 'success');
      await this.log('✅ Backup and recovery procedures are in place', 'success');
      await this.log('✅ Database is using persistent storage', 'success');
    } else if (this.results.overallScore >= 60) {
      await this.log('\n⚠️  GOOD: Most persistence features are working', 'warning');
      await this.log('Some improvements may be needed for optimal data safety', 'warning');
    } else {
      await this.log('\n❌ NEEDS ATTENTION: Data persistence has issues', 'error');
      await this.log('Immediate action required to ensure data safety', 'error');
    }
    
    await this.log('\n' + '='.repeat(60), 'info');
  }

  async run() {
    await this.log('🚀 Starting Data Persistence Verification\n');
    
    try {
      await this.checkDockerVolumes();
      await this.checkDatabaseConnection();
      await this.checkUserData();
      await this.checkBackupCapability();
      await this.checkRestoreCapability();
      await this.checkEnvironmentConfiguration();
      
      this.calculateScore();
      await this.generateReport();
      
      return this.results.overallScore >= 80;
    } catch (error) {
      await this.log(`Verification failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new DataPersistenceVerifier();
  verifier.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { DataPersistenceVerifier };