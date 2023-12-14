import sha256 from 'crypto-js/sha256';
import Base64Url from 'crypto-js/enc-base64url';

export function generateRandomString(): string {
  const array = new Uint32Array(28);
  const crypto = window.crypto || (window as any).msCrypto;
  crypto.getRandomValues(array);
  return [...array].map((dec) => ('0' + dec.toString(16)).slice(-2)).join('');
}

export async function pkceChallengeFromVerifier(v: string): Promise<string> {
  const hashed = sha256(v);
  return Base64Url.stringify(hashed);
}
