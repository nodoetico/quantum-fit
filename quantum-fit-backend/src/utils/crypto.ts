// Utilidad de cifrado simétrico para tokens sensibles (token de sesión MyFit)
// Usa AES-256-GCM derivando la clave desde JWT_SECRET (secreto ya configurado).
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function deriveKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'quantum_fit_token_encryption_fallback';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptToken(plainText: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(cipherText: string): string {
  const key = deriveKey();
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato de token cifrado inválido');
  }
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}
