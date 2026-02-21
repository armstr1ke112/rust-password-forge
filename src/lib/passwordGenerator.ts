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

// Microsoft-compatible charset: uppercase, lowercase, digits, and allowed special chars
const MS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MS_LOWER = "abcdefghijklmnopqrstuvwxyz";
const MS_DIGITS = "0123456789";
const MS_SPECIAL = "!@#$%^&*-_+=[]{}|\\:',.<>?/`~\"();";
const MS_CHARSET = MS_UPPER + MS_LOWER + MS_DIGITS + MS_SPECIAL;

export function generateMicrosoftPassword(length: number = 32): string {
  if (length < 16) {
    throw new Error("Password length must be at least 16 characters");
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Guarantee at least one from each category
  const guaranteed = [
    MS_UPPER[crypto.getRandomValues(new Uint8Array(1))[0] % MS_UPPER.length],
    MS_LOWER[crypto.getRandomValues(new Uint8Array(1))[0] % MS_LOWER.length],
    MS_DIGITS[crypto.getRandomValues(new Uint8Array(1))[0] % MS_DIGITS.length],
    MS_SPECIAL[crypto.getRandomValues(new Uint8Array(1))[0] % MS_SPECIAL.length],
  ];

  const rest = Array.from(array)
    .slice(0, length - guaranteed.length)
    .map((byte) => MS_CHARSET[byte % MS_CHARSET.length]);

  // Shuffle guaranteed chars into random positions
  const combined = [...guaranteed, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint8Array(1))[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  entropyBits: number;
} {
  // Calculate actual charset size used in the password
  let charsetSize = 0;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?`~\\]/.test(password)) charsetSize += 32;
  if (/[§±×÷√∞≠≈€£¥₿©®™µΩπδλΣΦΨΞ]/.test(password)) charsetSize += 18;

  const entropyBits = charsetSize > 0
    ? Math.floor(password.length * Math.log2(charsetSize))
    : 0;

  let label: string;
  if (entropyBits < 64) label = 'Weak';
  else if (entropyBits < 98) label = 'Fair';
  else if (entropyBits < 128) label = 'Good';
  else if (entropyBits < 192) label = 'Strong';
  else if (entropyBits < 256) label = 'Very Strong';
  else if (entropyBits < 384) label = 'Excellent';
  else if (entropyBits < 512) label = 'Maximum';
  else label = 'INSANE';

  // Normalize score to 0-8 for the progress bar
  const score = Math.min(Math.floor(entropyBits / 64), 8);

  return { score, label, entropyBits };
}
