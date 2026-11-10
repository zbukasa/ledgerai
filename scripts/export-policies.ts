// Writes the English in-app policies to docs/ so they can be linked or submitted
// (e.g. to Plaid). constants/LegalConstants.ts stays the single source of truth;
// rerun after editing it: npx tsx scripts/export-policies.ts
import { writeFileSync } from 'fs';
import { PRIVACY_POLICY, DATA_RETENTION_POLICY, TERMS_OF_SERVICE } from '../constants/LegalConstants';

const header = '<!-- Generated from constants/LegalConstants.ts by scripts/export-policies.ts. Do not edit by hand. -->\n';
const files: Record<string, string> = {
    'docs/PRIVACY_POLICY.md': PRIVACY_POLICY,
    'docs/DATA_RETENTION_POLICY.md': DATA_RETENTION_POLICY,
    'docs/TERMS_OF_SERVICE.md': TERMS_OF_SERVICE,
};
for (const [path, body] of Object.entries(files)) {
    writeFileSync(path, header + body.trim() + '\n');
    console.log(`wrote ${path}`);
}
