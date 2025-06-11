import { SecureNoteShareSettings, ShareResult, ShareOptions } from './types';
import { EncryptionService } from './encryption';

export class ApiService {
  private settings: SecureNoteShareSettings;

  constructor(settings: SecureNoteShareSettings) {
    this.settings = settings;
  }

  updateSettings(settings: SecureNoteShareSettings) {
    this.settings = settings;
  }

  /**
   * Uploads a note encrypted to the server
   */
  async uploadNote(content: string, options: ShareOptions): Promise<ShareResult> {
    try {      // 1. Generate encryption key
      const encryptionKey = EncryptionService.generateKey();
      let finalKey = encryptionKey;

      // 2. If password is set, derive key
      if (options.password) {
        const passwordHash = EncryptionService.hashPassword(options.password);
        finalKey = EncryptionService.deriveKeyWithPassword(encryptionKey, passwordHash);
      }

      // 3. Encrypt content
      const encryptedData = EncryptionService.encrypt(content, finalKey);      // 4. Prepare payload for server
      const payload = {
        encryptedContent: {
          data: encryptedData.encrypted,
          iv: encryptedData.iv,
          tag: encryptedData.tag
        },
        ttlMinutes: options.ttlMinutes,
        oneTimeView: options.oneTimeView,
        hasPassword: !!options.password
      };      // 5. Send to server
      const response = await fetch(`${this.settings.serverUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();      // 6. Compile share result
      const shareUrl = `${this.settings.serverUrl}/share/${result.id}?token=${encodeURIComponent(encryptionKey)}`;return {
        shareId: result.id,
        shareUrl: shareUrl,
        decryptionToken: encryptionKey, // Original key is used as token
        expiresAt: result.expiresAt
      };    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload error: ${error.message}`);
    }
  }

  /**
   * Downloads an encrypted note from the server
   */
  async downloadNote(shareId: string, decryptionToken: string, password?: string): Promise<string> {
    try {
      const response = await fetch(`${this.settings.serverUrl}/note/${shareId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Note not found or expired');
        }
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const encryptedContent = result.encryptedContent;      // Prepare decryption key
      let decryptionKey = decryptionToken;
      if (result.hasPassword && password) {
        const passwordHash = EncryptionService.hashPassword(password);
        decryptionKey = EncryptionService.deriveKeyWithPassword(decryptionToken, passwordHash);
      } else if (result.hasPassword && !password) {
        throw new Error('Password required');
      }      // Decrypt
      const decryptedContent = EncryptionService.decrypt({
        encrypted: encryptedContent.data,
        iv: encryptedContent.iv,
        tag: encryptedContent.tag
      }, decryptionKey);

      return decryptedContent;

    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
  /**
   * Revokes a share (deletes it from the server)
   */
  async revokeShare(shareId: string): Promise<void> {
    try {      const response = await fetch(`${this.settings.serverUrl}/revoke/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Revoke failed: ${response.status} ${response.statusText}`);
      }    } catch (error) {
      console.error('Revoke error:', error);
      throw new Error(`Revoke error: ${error.message}`);
    }
  }
}
