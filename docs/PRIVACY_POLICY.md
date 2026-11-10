<!-- Generated from constants/LegalConstants.ts by scripts/export-policies.ts. Do not edit by hand. -->
# Privacy Policy

**Effective Date: October 16, 2026**

## 1. Introduction
This Privacy Policy describes how LedgerAI (the "Service") collects, use, and disclose your personal information when you use our services. We are committed to protecting your privacy and ensuring the security of your financial data. By using our service, you agree to the collection and use of information in accordance with this policy.

## 2. Information We Collect
### 2.1 Financial Data via Plaid
We use Plaid, Inc. ("Plaid") to connect your bank accounts. By using our service, you grant us and Plaid the right, power, and authority to act on your behalf to access and transmit your personal and financial information from the relevant financial institution.
- **Account Identifiers:** Name, account type, and partial account numbers.
- **Transaction History:** Transaction dates, amounts, and descriptions for the past 24 months.
- **Balances:** Real-time account balances to provide accurate financial snapshots.

### 2.2 User-Provided Information
- **Account Details:** Name, email address, and profile preferences.
- **Communication:** Records of any correspondence with our support team.
- **User Content:** Any notes, categories, or custom data you manually enter into the application.

### 2.3 Automatically Collected Information
- **Usage Data:** Information on how you interact with the application, including features used and time spent.
- **Device Information:** IP address, browser type, and operating system for security and optimization purposes.

## 3. How We Use Your Information
- **AI-Powered Analysis:** User financial data is processed by Google Gemini AI for categorization and insight generation. Data is not used by Google to train foundation models for other users. **Your data is processed securely and is not used to train public AI models.**
- **Service Delivery:** To maintain your account and provide the core features of the expense tracker.
- **Service Improvement:** To analyze usage trends and improve the application's functionality.
- **Security & Compliance:** To detect and prevent fraud, unauthorized access, and comply with legal obligations.

## 4. Data Security & Encryption
We protect your data with the following safeguards:
- **Encryption in Transit:** All communication between the app, our servers and our service providers uses TLS 1.2 or higher.
- **Encryption at Rest:** Our database, hosted by Supabase, is encrypted at rest with AES-256. Bank access tokens are additionally encrypted by our application before they are stored, and are never sent to your device.
- **Account Security:** Passwords are stored only as salted bcrypt hashes, never in readable form. Login attempts are rate-limited to block password-guessing attacks.
- **Data Isolation:** Every request for financial data is checked against the signed-in account, so each user can only access their own data.
- **Access Control:** Access to production systems is limited to authorized personnel on a least-privilege basis and requires multi-factor authentication.

## 5. Data Sharing & Third Parties
We do not sell your personal information. We share data only with:
- **Plaid:** To facilitate bank connectivity.
- **Supabase:** For database hosting.
- **Google Cloud:** For application hosting and AI processing (Google Gemini).
- **Ad Partners:** Since the Free Tier is ad-supported, we may share anonymized device identifiers with advertising partners (such as Google AdMob) to serve non-personalized advertisements to users on the Free Tier.
- **Legal Authorities:** When required by law or to protect our legal rights, property, or safety.

## 6. Your Rights & Data Deletion
### 6.1 Right to Access and Portability
You have the right to request a copy of the personal data we hold about you in a structured, machine-readable format.

### 6.2 Right to be Forgotten
You have the right to request the deletion of your personal data at any time.
- **Account Deletion:** When you delete your account, your account details, ledger and bank data are permanently deleted from our production database immediately, and our access to your linked banks is revoked with Plaid. Residual copies in encrypted database backups expire automatically within 30 days.
- **Bank Disconnection:** When you disconnect a bank, we revoke our access with Plaid and immediately delete the accounts, balances and transactions we retrieved from that institution. Transactions you previously imported into your ledger remain part of your records unless you choose to remove them when disconnecting, or delete them later.
- **Requests by Email:** You can also request deletion, or a copy of your data, by emailing us at **tradelab.mantis@gmail.com**. We respond within 30 days.

### 6.3 GDPR & CCPA Compliance
If you are a resident of the European Economic Area (EEA) or California, you have specific rights regarding your personal information, including the right to access, correct, or delete your data.

## 7. Cookies and Tracking
We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.

## 8. Children's Privacy
Our service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children.

## 9. Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date."

## 10. Contact Us
If you have any questions about this Privacy Policy or our data practices, please contact us at: **tradelab.mantis@gmail.com**
