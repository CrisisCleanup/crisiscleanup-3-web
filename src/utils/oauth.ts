const crypto = window.crypto || (window as any).msCrypto;

export function generateRandomString(): string {
  const array = new Uint32Array(28);
  crypto.getRandomValues(array);
  return [...array].map((dec) => ('0' + dec.toString(16)).slice(-2)).join('');
}

function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  const uintArray = new Uint8Array(a);
  const array = [...uintArray];
  const str = String.fromCharCode.apply(null, array);
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function pkceChallengeFromVerifier(v: string): Promise<string> {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}
