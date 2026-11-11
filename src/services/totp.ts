import crypto from 'crypto';

// RFC 6238 time-based one-time passwords (the codes shown by Google Authenticator, Authy,
// 1Password, etc.): HMAC-SHA1, 6 digits, 30-second steps.

const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
    let bits = 0;
    let value = 0;
    let out = '';
    for (const byte of buf) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    return out;
}

export function base32Decode(input: string): Buffer {
    const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];
    for (const ch of clean) {
        const idx = BASE32_ALPHABET.indexOf(ch);
        if (idx === -1) throw new Error('Invalid base32 character');
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}

/** A new random 160-bit secret, base32-encoded for authenticator apps. */
export function generateTotpSecret(): string {
    return base32Encode(crypto.randomBytes(20));
}

export function currentStep(now = Date.now()): number {
    return Math.floor(now / 1000 / STEP_SECONDS);
}

export function totpAt(secret: string, step: number): string {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(step));
    const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = ((hmac[offset] & 0x7f) << 24)
        | (hmac[offset + 1] << 16)
        | (hmac[offset + 2] << 8)
        | hmac[offset + 3];
    return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

/**
 * Checks a code against the previous, current and next step (tolerates ~30s of clock drift).
 * Returns the matched step so the caller can reject reuse of the same or an older code,
 * or null if the code doesn't match.
 */
export function verifyTotp(secret: string, code: string, lastUsedStep: number | null | undefined): number | null {
    const normalized = String(code || '').replace(/\s/g, '');
    if (!/^\d{6}$/.test(normalized)) return null;
    const now = currentStep();
    for (const step of [now - 1, now, now + 1]) {
        if (lastUsedStep != null && step <= lastUsedStep) continue;
        const expected = totpAt(secret, step);
        if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))) return step;
    }
    return null;
}

export function otpauthUrl(issuer: string, account: string, secret: string): string {
    const label = encodeURIComponent(`${issuer}:${account}`);
    const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: String(DIGITS), period: String(STEP_SECONDS) });
    return `otpauth://totp/${label}?${params.toString()}`;
}

/** Ten single-use recovery codes like "7KQ2-M9XD-4TPA", for when the authenticator is lost. */
export function generateRecoveryCodes(count = 10): string[] {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid misreading
    return Array.from({ length: count }, () => {
        const bytes = crypto.randomBytes(12);
        const chars = Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
        return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
    });
}

export function normalizeRecoveryCode(code: string): string {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function hashRecoveryCode(code: string): string {
    return crypto.createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');
}
