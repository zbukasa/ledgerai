# LedgerAI Information Security Policy

| | |
|---|---|
| **Owner** | [Name], Founder & Security Lead |
| **Security contact** | tradelab.mantis@gmail.com |
| **Effective date** | October 16, 2026 |
| **Review cycle** | At least annually, and after any security incident or significant change to the system |

## 1. Purpose and scope

This policy defines how LedgerAI identifies, mitigates and monitors information security risks. It covers every system that stores or processes customer data, including consumer financial data received from Plaid, and everyone with access to those systems (employees, contractors and the founder).

## 2. Roles and responsibilities

- **Security Lead:** owns this policy, approves access to production systems, runs the reviews in section 10 and leads incident response.
- **Everyone with system access:** follows this policy, protects their credentials and devices, and reports suspected incidents to the security contact immediately.

## 3. System inventory

| System | Purpose | Holds customer data |
|---|---|---|
| Supabase (Postgres) | Production database | Yes, including Plaid data |
| Google Cloud | Application hosting, Gemini AI processing | Yes, in transit and processing |
| Plaid | Bank connectivity | Yes |
| GitHub | Source code, CI, vulnerability scanning | No (secrets must never be committed) |
| Google Play / Apple App Store | App distribution and subscription billing | Billing data only |
| Developer workstations | Development | No production data may be stored locally |

The Security Lead keeps this table current as systems are added or removed.

## 4. Data classification

- **Restricted:** bank access tokens, consumer financial data from Plaid, passwords and other secrets. Encrypted at rest; access only through the application or by the Security Lead for incident response.
- **Confidential:** account details (name, email) and ledger data. Encrypted at rest; least-privilege access.
- **Internal:** source code and this policy.

## 5. Access control

1. **Unique accounts.** Every person uses an individual account on each system. No shared logins.
2. **Least privilege.** Access is limited to what the role requires, using each provider's built-in roles (Supabase project roles, Google Cloud IAM, GitHub repository roles). Production data access is limited to the Security Lead.
3. **Multi-factor authentication.** MFA is required on every account with access to Supabase, Google Cloud, GitHub, Plaid and the app-store consoles, and on the email account used to recover them. Use an authenticator app or security key, not SMS.
4. **Granting access.** Production access is granted only with the Security Lead's approval and recorded in the access register (section 10).
5. **Removing access.** When someone leaves or changes role, their access to all systems is removed or adjusted within 24 hours, and any shared secrets they could see are rotated.
6. **Secrets management.** Application secrets (`JWT_SECRET`, `INTERNAL_API_KEY`, `BANK_TOKEN_ENCRYPTION_KEY`, database and API credentials) are stored only in the hosting provider's secret configuration or local `.env` files excluded from git. The server refuses to start without them. Secrets are rotated immediately if exposure is suspected.
7. **Application access.** Customer passwords are stored as bcrypt hashes. Every API request is authenticated, and access to financial data is checked against the owning account. Login is rate-limited.

## 6. Data protection

- **In transit:** TLS 1.2 or higher for all connections between clients, the application, the database and third-party APIs.
- **At rest:** AES-256 storage encryption on the Supabase database. Bank access tokens are additionally encrypted by the application (Fernet) and are never sent to clients.
- **Retention and deletion:** as defined in the Data Retention & Security Policy shown in the app. Users can delete their account and disconnect banks. Deletion is permanent and includes revoking the link with Plaid.

## 7. Secure development

- All code changes are tracked in git. Changes to authentication, authorization or data-handling code receive a security review before release.
- Strict TypeScript type checking must pass before every build.
- GitHub CodeQL scans run on every push and pull request and weekly. `npm audit` runs on every push.
- Secret scanning: the repository is checked for committed credentials. Any credential found in git history is treated as compromised and rotated.

## 8. Vulnerability management

**Detection**
- Dependabot alerts and weekly dependency update pull requests.
- CodeQL static analysis, and `npm audit` for production dependencies, in CI.
- Developer workstations: supported OS versions with automatic security updates and built-in endpoint protection (e.g. Microsoft Defender) enabled.

**Remediation timelines** (from when the vulnerability is identified)

| Severity | Fix or mitigate within |
|---|---|
| Critical | 7 days |
| High | 30 days |
| Medium | 90 days |
| Low | Next scheduled maintenance |

If no fix exists, the Security Lead records the risk, applies a mitigation (e.g. replacing the dependency or restricting its use), and reviews it monthly until it is resolved.

**End-of-life software.** Runtimes (Node.js), frameworks and dependencies must be on versions that still receive security updates. EOL dates are checked at each quarterly review, and anything reaching end of life within 6 months is scheduled for upgrade.

## 9. Incident response

1. **Identify:** anyone who suspects an incident reports it to the security contact immediately. The Security Lead assesses scope and severity.
2. **Contain:** revoke affected credentials and sessions, rotate secrets, and disable affected features or bank connections.
3. **Eradicate:** remove the root cause and patch the vulnerability.
4. **Recover:** restore normal service and confirm the fix.
5. **Notify:** inform affected users and regulators as required by applicable law (e.g. PIPEDA breach reporting), and inform Plaid and other affected partners as required by our agreements, without undue delay.
6. **Review:** write a post-incident review within 14 days, covering cause, impact and preventive actions.

## 10. Operational reviews

| Review | Frequency | What it covers |
|---|---|---|
| Access review | Quarterly | Every account on every system in section 3: still needed, least privilege, MFA on. Results recorded in the access register. |
| Vulnerability review | Monthly | Open Dependabot, CodeQL and audit findings checked against the SLA in section 8. |
| EOL review | Quarterly | Runtime and dependency support dates. |
| Policy review | Annually | This policy and the Data Retention & Security Policy. |

Review results are recorded with the date and outcome in `docs/security-reviews/` (or another location the Security Lead designates).

## 11. Third-party providers

Providers that store or process customer data (section 3) are chosen for their security posture (e.g. SOC 2 reports) and reviewed annually. Only the data needed for the service is shared with them.
