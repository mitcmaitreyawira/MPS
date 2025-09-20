# Safety Guards Documentation

This document outlines the safety guards implemented to protect against accidental data loss and destructive operations.

## Overview

Safety guards have been implemented across the application to prevent accidental execution of dangerous operations that could result in data loss or system corruption.

## Protected Operations

### 1. Admin Controller Operations

All dangerous admin operations now require explicit confirmation:

#### Bulk Delete Users
- **Endpoint**: `POST /admin/bulk-delete-users`
- **Safety Guard**: Requires `confirmDeletion: "yes-i-know"` in request body
- **Example**:
  ```json
  {
    "userIds": ["user1", "user2"],
    "confirmDeletion": "yes-i-know"
  }
  ```

#### Delete Badge
- **Endpoint**: `POST /admin/badge/:badgeId/delete`
- **Safety Guard**: Requires `confirmDeletion: "yes-i-know"` in request body
- **Example**:
  ```json
  {
    "confirmDeletion": "yes-i-know"
  }
  ```

#### Emergency System Reset
- **Endpoint**: `POST /admin/emergency-reset`
- **Safety Guard**: Requires `confirmReset: "yes-i-know-this-is-destructive"` in request body
- **Example**:
  ```json
  {
    "confirmReset": "yes-i-know-this-is-destructive"
  }
  ```

### 2. Cleanup Controller Operations

#### Monthly Maintenance
- **Endpoint**: `POST /cleanup/maintenance?confirm=yes-i-know`
- **Safety Guard**: Requires `confirm=yes-i-know` query parameter

#### Manual Cleanup
- **Endpoint**: `POST /cleanup/manual`
- **Safety Guard**: 
  - For dry runs: No confirmation required (`dryRun=true`)
  - For actual deletion: Requires `confirm=yes-i-know` query parameter
- **Example**: `/cleanup/manual?dryRun=false&confirm=yes-i-know`

### 3. Database Scripts

#### Demo Users Seeding
- **Script**: `src/scripts/seed-demo-users.ts`
- **Safety Guard**: Requires `--yes-i-know` command line flag
- **Usage**:
  ```bash
  # Via npm script
  npm run seed:demo -- --yes-i-know
  
  # Direct execution
  node dist/scripts/seed-demo-users.js --yes-i-know
  ```

## Safety Guard Patterns

### 1. Confirmation Strings
- **Standard**: `"yes-i-know"` for regular dangerous operations
- **Nuclear**: `"yes-i-know-this-is-destructive"` for extremely dangerous operations

### 2. Command Line Flags
- **Standard**: `--yes-i-know` for scripts that modify data

### 3. Dry Run Support
- Many operations support `dryRun=true` to preview changes without executing them
- Dry runs do not require confirmation flags

## Rate Limiting

Dangerous operations are also protected by rate limiting:
- **Bulk delete users**: 2 requests per 5 minutes
- **Badge deletion**: 10 requests per minute
- **Emergency reset**: 1 request per hour

## Error Messages

When safety guards are triggered, clear error messages are provided:

```
Safety guard: confirmDeletion must be "yes-i-know" to proceed with this dangerous operation
```

```
Safety guard: This script creates demo users in the database.
To proceed, run: npm run seed:demo -- --yes-i-know
```

## Best Practices

### For Developers
1. **Always test with dry runs first** when available
2. **Double-check confirmation strings** - they are case-sensitive
3. **Use rate limiting as an additional safety net**
4. **Review logs** after dangerous operations to confirm expected results

### For Administrators
1. **Backup data** before running destructive operations
2. **Use staging environments** to test dangerous operations first
3. **Monitor application logs** during and after operations
4. **Have rollback procedures** ready

### For CI/CD
1. **Never include confirmation flags** in automated scripts
2. **Use dry runs** for validation in pipelines
3. **Require manual approval** for production deployments involving dangerous operations

## Bypassing Safety Guards

⚠️ **WARNING**: Safety guards should never be bypassed in production environments.

If you need to bypass safety guards for testing or development:
1. **Use a dedicated test database**
2. **Document the reason** for bypassing
3. **Restore safety guards** immediately after testing
4. **Never commit bypassed safety guards** to version control

## Monitoring and Logging

All dangerous operations are logged with:
- **Timestamp** of the operation
- **User/admin** who performed the operation
- **Operation details** (what was deleted/modified)
- **Results** (number of records affected)

Example log entries:
```
[AdminController] Admin bulk delete users requested for 5 users
[CleanupService] Manual cleanup completed - Deleted 1250 metrics and 45 sync operations
[SeedScript] Demo users seeding completed - Created 3 users
```

## Troubleshooting

### Common Issues

1. **"Safety guard" error messages**
   - **Cause**: Missing or incorrect confirmation parameter
   - **Solution**: Check the exact confirmation string required

2. **Rate limit exceeded**
   - **Cause**: Too many dangerous operations in short time
   - **Solution**: Wait for rate limit window to reset

3. **Script exits with safety message**
   - **Cause**: Missing `--yes-i-know` flag
   - **Solution**: Add the required flag to the command

### Getting Help

If you encounter issues with safety guards:
1. Check this documentation first
2. Review application logs for specific error messages
3. Verify you're using the correct confirmation strings/flags
4. Test with dry runs when available

## Updates and Maintenance

This safety guard system should be:
- **Reviewed regularly** to ensure it covers new dangerous operations
- **Updated** when new destructive endpoints are added
- **Tested** as part of the CI/CD pipeline
- **Documented** with any changes to confirmation strings or procedures