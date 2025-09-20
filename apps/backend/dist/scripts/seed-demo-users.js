"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../modules/users/users.service");
const demoUsers = [
    {
        nisn: 'ADMIN001',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin']
    },
    {
        nisn: 'TEACH001',
        password: 'Teacher123!',
        firstName: 'John',
        lastName: 'Smith',
        roles: ['teacher']
    },
    {
        nisn: '1001234567',
        password: 'Student123!',
        firstName: 'Alice',
        lastName: 'Wilson',
        roles: ['student']
    }
];
async function seedDemoUsers() {
    const args = process.argv.slice(2);
    const hasConfirmFlag = args.includes('--yes-i-know');
    if (!hasConfirmFlag) {
        console.error('❌ Safety guard: This script creates demo users in the database.');
        console.error('   To proceed, run: npm run seed:demo -- --yes-i-know');
        console.error('   Or: node dist/scripts/seed-demo-users.js --yes-i-know');
        process.exit(1);
    }
    console.log('🚀 Starting demo users seeding...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    try {
        console.log('👥 Creating demo users...');
        for (const userData of demoUsers) {
            try {
                const user = await usersService.create(userData);
                console.log(`✅ Created user: ${userData.nisn} (${userData.firstName} ${userData.lastName})`);
            }
            catch (error) {
                if (error instanceof Error && error.message?.includes('already exists')) {
                    console.log(`⚠️  User ${userData.nisn} already exists, skipping...`);
                }
                else {
                    console.error(`❌ Failed to create user ${userData.nisn}:`, error instanceof Error ? error.message : String(error));
                }
            }
        }
        console.log('🎉 Demo users seeding completed!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
seedDemoUsers();
//# sourceMappingURL=seed-demo-users.js.map