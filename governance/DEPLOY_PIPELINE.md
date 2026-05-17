# Deploy Pipeline: Trust but Verify

When AI agents can commit and deploy code, your deploy pipeline is your last line of defense. Here's how I structured mine.

## The Pipeline

Every production deploy runs through these gates, in order:

```
1. npm test                    → Unit tests must pass
2. git status check            → No uncommitted changes allowed
3. Database migrations         → Schema changes applied
4. Row-Level Security check    → Every public table must have RLS policies
5. vercel build --prod         → Local build (catches type errors, broken imports)
6. vercel deploy --prebuilt    → Upload pre-verified artifacts
7. Domain alias                → Point all production domains to the new deploy
8. git push                    → Push to origin/main
```

## Why Each Gate Exists

**Test gate (Step 1):** AI agents are tempted to skip tests when they're confident the code is correct. Confidence is not verification. The gate is mandatory, no `--no-verify` allowed.

**Git status check (Step 2):** Agents sometimes leave debugging artifacts, temporary files, or `.env` modifications. A clean working tree means the deploy matches exactly what was committed.

**RLS gate (Step 4):** This one is healthcare-specific but the pattern is universal. Every table that holds patient or physician data must have row-level security policies in PostgreSQL. The gate queries `pg_class` and `pg_policies` — if any public table lacks RLS, the deploy is blocked.

```bash
# Simplified RLS check
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
EXCEPT
SELECT tablename FROM pg_policies WHERE schemaname = 'public';
# If any rows returned → deploy blocked
```

**No new table should ever reach production without access controls.** This gate makes that impossible to forget, regardless of which agent created the table.

**Local build (Step 5):** We build locally and upload pre-built artifacts rather than building on the CI server. This gives us a verified artifact — the exact thing we built locally is the exact thing that runs in production.

## The Pattern

The deploy pipeline is a **trust boundary**. Inside the pipeline, AI agents have freedom to write whatever code they think is correct. At the pipeline boundary, automated checks verify the output meets minimum safety standards.

This is the same principle behind code review, just automated:

- Humans review for correctness and intent
- The pipeline reviews for safety invariants
- Both must pass before code reaches production
