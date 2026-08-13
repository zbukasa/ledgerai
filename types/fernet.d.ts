// Minimal type shim for the untyped 'fernet' package.
declare module 'fernet' {
  export class Secret {
    constructor(secret: string);
  }
  export class Token {
    constructor(opts: { secret: Secret; token?: string; ttl?: number; time?: number; iv?: number[] });
    encode(message: string): string;
    decode(): string;
  }
  const _default: { Secret: typeof Secret; Token: typeof Token };
  export default _default;
}
