import CryptoJS from 'crypto-js';
import type { MessagePayload, EncryptedMessage } from '@/types/glyph';

/**
 * Encrypts a MessagePayload using AES-256 with a user-provided password.
 * Returns a Base64-encoded ciphertext string.
 */
export function encryptMessage(
  payload: MessagePayload,
  password: string
): string {
  const jsonString = JSON.stringify(payload);
  const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
  return encrypted;
}

/**
 * Decrypts a ciphertext string using AES-256 with the provided password.
 * Returns the original MessagePayload or null if decryption fails.
 */
export function decryptMessage(
  ciphertext: string,
  password: string
): MessagePayload | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return null;
    return JSON.parse(decryptedString) as MessagePayload;
  } catch {
    return null;
  }
}

/**
 * Generates a unique message ID for shareable URLs.
 */
export function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Creates an EncryptedMessage object ready for storage.
 */
export function createEncryptedMessage(
  payload: MessagePayload,
  password: string
): EncryptedMessage {
  return {
    id: generateMessageId(),
    ciphertext: encryptMessage(payload, password),
    hint: payload.hint,
    createdAt: Date.now(),
  };
}
