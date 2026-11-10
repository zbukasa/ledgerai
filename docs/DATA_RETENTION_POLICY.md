<!-- Generated from constants/LegalConstants.ts by scripts/export-policies.ts. Do not edit by hand. -->
# Data Retention & Security Policy

**Effective Date: October 16, 2026**

## 1. Overview
This policy explains what data LedgerAI keeps, how long we keep it and how it is deleted. It applies to all personal and financial data we process, including data received through Plaid. We review this policy at least once a year and whenever our data practices change.

## 2. Retention Principles
- **Data Minimization:** We request only the Plaid products needed for LedgerAI's features (Transactions, Identity and Balance).
- **Purpose Limitation:** Data is used only to provide the Service as described in our Privacy Policy.
- **Storage Limitation:** We keep data only while your account is active, or for as long as the law requires.

## 3. Retention Periods
- **Account and Ledger Data:** Kept while your account is active.
- **Bank Data from Plaid** (accounts, balances, transactions and access tokens): Kept until you disconnect that bank or delete your account.
- **Server Logs:** Kept for up to 30 days for security and troubleshooting.
- **Database Backups:** Encrypted, and expire automatically within 30 days.

## 4. Deletion
- **Account Deletion:** You can delete your account from the app or by emailing **tradelab.mantis@gmail.com**. Your account, ledger and bank data are permanently deleted from our production database immediately, and our access to your linked banks is revoked with Plaid. Copies in encrypted backups expire within 30 days.
- **Bank Disconnection:** Disconnecting a bank revokes our access with Plaid and immediately deletes the accounts, balances and transactions retrieved from it. You can choose to also remove the transactions you imported into your ledger from that bank.
- **Data on Your Device:** LedgerAI keeps a working copy of your ledger on your device so it works offline. Uninstalling the app removes this copy.

## 5. Security Controls
- **Encryption:** TLS 1.2 or higher in transit; AES-256 at rest in our database. Bank access tokens are additionally encrypted by our application.
- **Access Control:** Least-privilege access to production systems, with multi-factor authentication required for all administrative access to our database, hosting and source code.
- **Vulnerability Management:** Automated dependency and code scanning, with identified vulnerabilities fixed within defined timelines based on severity.
- **Incident Response:** We maintain an incident response plan covering identification, containment, eradication and recovery. If a breach affects your data, we will notify you and the relevant authorities as required by applicable law.

## 6. Data Disposal
Deleted data is permanently removed from our production database, not just hidden or marked as deleted.
