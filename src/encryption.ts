import * as CryptoJS from 'crypto-js';

export class EncryptionService {  /**
   * Generates a random key for encryption
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
  /**
   * Generates a random token for decryption
   */
  static generateToken(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }  /**
  * Encrypts content with AES-256-CTR
  */
  static encrypt(content: string, key: string): { encrypted: string; iv: string; tag: string } {
    const iv = CryptoJS.lib.WordArray.random(96/8);

    const encrypted = CryptoJS.AES.encrypt(content, CryptoJS.enc.Hex.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding    });

    // Generate a mock tag for compatibility
    const tag = CryptoJS.lib.WordArray.random(128/8);return {
      encrypted: encrypted.ciphertext.toString(CryptoJS.enc.Hex), // Store as Hex
      iv: iv.toString(CryptoJS.enc.Hex), // Store as Hex
      tag: tag.toString(CryptoJS.enc.Hex) // Store as Hex
    };
  }  /**
  * Decrypts content with AES-256-CTR
  */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    // Create CipherParams object
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedData.encrypted)
    });

    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  /**
   * Hashes a password with SHA-256
   */
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  /**
   * Combines key and password hash for additional security
   */
  static deriveKeyWithPassword(baseKey: string, passwordHash: string): string {
    return CryptoJS.PBKDF2(baseKey, passwordHash, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }
}
