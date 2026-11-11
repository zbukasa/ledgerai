# Access review: November 2026

**Reviewer:** Zenas Bukasa, Security Lead
**Date:** 2026-11-10
**Policy:** `docs/INFORMATION_SECURITY_POLICY.md` §5 and §10

| System | Accounts with access | Role | MFA | Still needed | Notes |
|---|---|---|---|---|---|
| GitHub `zbukasa/ledgerai` | zbukasa (only collaborator) | Admin | ☐ confirm | Yes | No deploy keys, webhooks or Actions secrets. Dependabot alerts and security updates, secret scanning and push protection enabled 2026-11-10. |
| Supabase project | ☐ list members | ☐ | ☐ | ☐ | Project was paused/unreachable as of 2026-07; confirm status. |
| Google Cloud / AI Studio | ☐ list IAM principals | ☐ | ☐ | ☐ | Also check for unused service-account keys. |
| Google account (recovery email for the above) | ☐ | — | ☐ | — | |
| Plaid dashboard | ☐ list team members | ☐ | ☐ | ☐ | |
| Google Play / App Store consoles | ☐ | ☐ | ☐ | ☐ | |

## Secrets rotated this cycle

- 2026-11-10: `JWT_SECRET`, `INTERNAL_API_KEY` and `BANK_TOKEN_ENCRYPTION_KEY` regenerated in the local `.env.local`. Unused `VITE_`-prefixed secret copies removed.
- ☐ Set the same new values in the production hosting environment.
- ☐ Supabase DB password, Gemini API key and Google Maps API key: rotate at each provider (exposed in the public repo's old history).

## Outcome

☐ All accounts justified, MFA confirmed on every account. Sign and date when complete.
