# LedgerAI — Security Remediation Checklist

This file tracks the fixes applied during the security-hardening pass and the manual
follow-up actions that **only you can perform** (rotating credentials, running the DB
migration, purging git history).

---

## 🔴 DO THESE NOW — compromised credentials

These secrets were committed to the repo and must be treated as public. Removing them
from the code (done) is not enough — **they must be rotated**.

- [ ] **Rotate the Supabase / Postgres password.**
      The `postgres` superuser password was committed in plain text in
      `src/db/push.ts` and `test-db-connection.ts` (see commit `2cc55a2`). Change it in the Supabase dashboard
      (Project Settings → Database → Reset database password), then update `DATABASE_URL`
      in your `.env.local` and deployment env.
- [ ] **Rotate the Gemini API key.**
      It was inlined into every client bundle. Revoke the old key in Google AI Studio /
      Cloud console and issue a new one. Put the new value in `GEMINI_API_KEY` (server env
      only — it is no longer shipped to clients).
- [ ] **Rotate the Google Maps API key** if it was ever distributed in a build, and add
      HTTP-referrer / API restrictions to it.
- [ ] **Set fresh, strong values** for `JWT_SECRET`, `INTERNAL_API_KEY`, and
      `BANK_TOKEN_ENCRYPTION_KEY` (the server now refuses to start without them).
      Generate with: `openssl rand -base64 48`

## 🔴 Purge git history

The secrets remain in the git history (commit `2cc55a2`) even though the working tree is
clean. Since this is effectively a single-commit repo:

- [ ] Purge with `git filter-repo` (preferred) or BFG:
      ```
      git filter-repo --path src/db/push.ts --path test-db-connection.ts --invert-paths
      # then re-add the cleaned versions
      ```
      Or, simplest for a fresh repo: squash to a new root commit after confirming no
      secret strings remain in the history (`git log -p | grep -i <old-password>`).
- [ ] Force-push if this was ever pushed to a remote, and rotate anything exposed.

## 🟠 Run the database migration

The schema changed (new columns + constraints). Generate and apply a migration:

- [ ] `npx drizzle-kit generate` then apply it (or `npx drizzle-kit push` for dev).
- [ ] New/changed schema objects to expect:
  - `users.password_hash`, `users.voice_commands_used`, `users.scans_used`,
    `users.usage_period_start`
  - `transactions` dedup unique is now **(user_id, hash_idempotency)** (was global on hash)
  - `bank_transactions.connection_id` (new) and dedup unique now **(account_id, hash)**
  - `promo_redemptions` unique on **(user_id, promo_code)**
- [ ] Existing users have `password_hash = NULL` and cannot log in until they set a
      password — decide on a password-reset / re-onboarding flow for any real accounts.

---

## ✅ Fixed in code (this branch: `security-hardening`)

**Authentication**
- `/auth/token` now verifies a bcrypt password hash; no more "any password works".
- `/auth/register` hashes passwords (bcrypt, 12 rounds) and rejects weak input.
- Removed the `/api/login` backdoor that minted a JWT for `user-1` with no credentials.
- JWTs now expire (`JWT_EXPIRES_IN`, default 2h). Auth endpoints are rate-limited.
- Removed silent user auto-provisioning; login no longer leaks the API key.

**Secrets & config**
- No more hardcoded fallback secrets — the server fails fast if `JWT_SECRET`,
  `INTERNAL_API_KEY`, or `BANK_TOKEN_ENCRYPTION_KEY` are unset.
- Removed committed DB credentials from `src/db/push.ts` and `test-db-connection.ts`.
- Gemini key removed from the client bundle; all calls go through `/api/ai/*` proxy
  (REST for receipts/insights, ephemeral tokens for live voice).
- `.gitignore` now ignores `.env`, `.env.*`, `*.zip`, `uploads/`. Removed `ledgerai.zip`.
- `check-env.ts` no longer prints credential values.

**Access control (IDOR)**
- Ownership checks added to every bank, trip, and inventory-batch endpoint.
- Encrypted bank tokens are never serialized to clients (column projection).
- Transaction/trip upserts can no longer hijack or reassign another user's rows.
- Bulk ingestion requires a real `userId` and no longer defaults to a shared `system`.

**Server-authoritative enforcement**
- Usage limits (voice/scans/insights) are enforced server-side via `/account/usage/consume`
  and inside the AI proxy — client-side bypasses no longer grant real metered resources.
- Promo redemption is now race-safe (atomic conditional increment + DB unique constraint).
- Socket.IO requires a valid JWT and rooms are keyed by the authenticated user (was: any
  client could join any business room). CORS is an allowlist in production.

**Financial correctness / data integrity**
- Transaction date no longer shifts a day for users west of UTC (local-date helpers).
- Per-user dedup hash (was global — dropped cross-tenant transactions).
- Money aggregation uses `numeric`, not binary float.
- Inventory batch resubmit applies the delta (was double-counting).
- Currency conversion refuses to guess on a missing rate (was silently mixing currencies).
- Receipt extraction failures surface to the user instead of silently dropping receipts.
- Voice hook releases the microphone on failure/unmount (was leaking the stream).
- Reports exclude archived records and scope personal-mode to the current user.

**Build / tooling**
- `strict` TypeScript enabled; fixed the latent errors it surfaced. `npm run build` now
  typechecks first. Added `@types/react`, `@types/react-dom`.
- Merged the nested `ledgerai/` copy's real UI fixes into root and deleted the duplicate.
- `npm audit fix` (non-breaking) applied: 38 → 16 advisories; runtime Drizzle SQLi resolved.

---

## 🟡 Remaining follow-ups (flagged, not yet done)

- [ ] **`xlsx@0.18.5`** (prototype pollution + ReDoS) has **no npm-registry fix**. Migrate
      to the maintained SheetJS CDN build (`https://cdn.sheetjs.com/`) or swap to
      `exceljs`. Left in place to avoid breaking the export feature silently.
- [ ] **`drizzle-kit`** advisory needs a breaking major bump — dev-only migration tool,
      upgrade when you next touch migrations.
- [ ] **Client paywall/biometric UX**: `BiometricAuth` and subscription gates are still
      UX-only on the client. The *resources* are now enforced server-side, but consider a
      real biometric check (WebAuthn / native) and server-verified subscription state.
- [ ] **Bundle size**: the main chunk is ~3.6 MB — consider code-splitting.
- [ ] Bundle a proper password-reset flow for the new `password_hash` requirement.
