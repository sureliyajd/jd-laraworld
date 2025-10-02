// pkce.ts
function base64UrlEncode(buffer: ArrayBuffer): string {
  let str = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}

export function generateCodeVerifier(length: number = 128): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}
