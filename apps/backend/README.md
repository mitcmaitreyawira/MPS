# Backend (NestJS)

This is the NestJS API server for the MPS Launch application.

## Development

```bash
# From the repo root
pnpm --filter @template/backend dev

# Run tests
pnpm --filter @template/backend test
```

## Backend Conventions and Notes

- **Audit logs**: Use `AuditLogsService.create(dto, userId, userName)` everywhere.
  - Example:
    ```ts
    await auditLogsService.create(
      { action: 'user_update', details: { userId } },
      currentUser.id,
      currentUser.name,
    );
    ```

- **Cache invalidation**: `CacheService` supports both methods for compatibility.
  - `deletePattern(pattern: string)` — preferred for new code (e.g., `DataSyncService`).
  - `invalidatePattern(pattern: string)` — legacy alias used by helpers like `UserCacheHelper`.
  - Prefer `deletePattern` in new code; keep `invalidatePattern` for backward compatibility.

- **Indexes**: Avoid duplicate Mongoose index declarations. If a field is indexed via `@Prop({ unique: true, index: true })`, do not add a redundant `Schema.index({ field: 1 })` for the same field.

## Testing

```bash
pnpm --filter @template/backend test
pnpm --filter @template/backend test:watch
```
