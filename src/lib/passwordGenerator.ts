import { argon2id, sha256 } from 'hash-wasm';

const CHARSET = 
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "abcdefghijklmnopqrstuvwxyz" +
  "0123456789" +
  "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~" +
  "§±×÷√∞≠≈€£¥₿©®™µΩπδλΣΦΨΞ";

export async function derivePassword(
  master: string,
  domain: string,
  length: number
): Promise<string> {
  if (length < 16) {
    throw new Error("Password length must be at least 16 characters");
  }

  // Salt = SHA256(domain) - same as Rust implementation
  const saltHash = await sha256(domain);
  const salt = new Uint8Array(saltHash.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));

  // Argon2id with same parameters as Rust code:
  // 64 MB memory, 4 iterations, 2 parallelism
  const hash = await argon2id({
    password: master,
    salt: salt,
    parallelism: 2,
    iterations: 4,
    memorySize: 65536, // 64 MB
    hashLength: length * 2,
    outputType: 'binary',
  });

  // Convert bytes to characters using CHARSET - same as Rust
  const password = Array.from(hash)
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
