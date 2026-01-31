import argon2 from 'argon2-browser';

const CHARSET = 
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "abcdefghijklmnopqrstuvwxyz" +
  "0123456789" +
  "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~" +
  "§±×÷√∞≠≈€£¥₿©®™µΩπδλΣΦΨΞ";

async function sha256(message: string): Promise<Uint8Array> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return new Uint8Array(hashBuffer);
}

export async function derivePassword(
  master: string,
  domain: string,
  length: number
): Promise<string> {
  if (length < 16) {
    throw new Error("Password length must be at least 16 characters");
  }

  // Salt = SHA256(domain)
  const saltHash = await sha256(domain);

  // Argon2id with the same parameters as Rust code
  const result = await argon2.hash({
    pass: master,
    salt: saltHash,
    time: 4,        // iterations
    mem: 65536,     // 64 MB RAM
    parallelism: 2,
    hashLen: length * 2,
    type: argon2.ArgonType.Argon2id,
  });

  // Convert bytes to characters using CHARSET
  const hashArray = result.hash instanceof Uint8Array 
    ? Array.from(result.hash) 
    : Array.from(new Uint8Array(result.hash as ArrayBuffer));
  
  const password = hashArray
    .slice(0, length)
    .map((byte: number) => CHARSET[byte % CHARSET.length])
    .join('');

  return password;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  
  if (password.length >= 16) score += 1;
  if (password.length >= 32) score += 1;
  if (password.length >= 48) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?`~]/.test(password)) score += 1;
  if (/[§±×÷√∞≠≈€£¥₿©®™µΩπδλΣΦΨΞ]/.test(password)) score += 1;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent', 'Maximum', 'INSANE'];
  
  return {
    score: Math.min(score, 8),
    label: labels[Math.min(score, labels.length - 1)],
  };
}
