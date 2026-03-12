# Resolving Prisma migration drift

Your database schema is out of sync with the migration history (e.g. DB was created with `db push` or migrations were applied in a different order). Choose one approach below.

---

## Option A: Add only the new tables (no data loss)

Use this if you want to **keep all existing data** and just add/update the `Document` table (page-level; no chunks):

```bash
bunx prisma db push
```

- Applies the current `schema.prisma` to the database (creates/updates `Document`).
- Does **not** use migration history; no reset.
- Drift warning may still appear on future `migrate dev` until history is resolved.

---

## Option B: Clean reset (dev only, all data lost)

Use this only if this is a **development** database and you are okay **losing all data**:

```bash
bunx prisma migrate reset
```

- Drops the database, reapplies all migrations, then runs `seed` if configured.
- After this, migration history and DB will match.

---

## Option C: Mark migrations as applied (advanced)

If the database already matches the **existing** migrations and you only need to add the new Document migration:

1. Mark all migrations up to the last one as applied:  
   `bunx prisma migrate resolve --applied "20260223053040_removed_autoincr_for_user"`
2. Run the new migration:  
   `bunx prisma migrate deploy`

Use only if you are sure the current DB state matches the migration history up to that point.
