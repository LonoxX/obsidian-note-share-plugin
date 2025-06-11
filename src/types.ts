export interface SecureNoteShareSettings {
  serverUrl: string;
  defaultTtlMinutes: number;
}

export const DEFAULT_SETTINGS: SecureNoteShareSettings = {
  serverUrl: 'http://localhost:3000',
  defaultTtlMinutes: 60
};

export interface ShareResult {
  shareId: string;
  shareUrl: string;
  decryptionToken: string;
  expiresAt: number;
}

export interface ShareOptions {
  ttlMinutes: number;
  password?: string;
  oneTimeView: boolean;
  includeAttachments: boolean;
}

export interface ActiveShare {
  id: string;
  noteTitle: string;
  createdAt: number;
  expiresAt: number;
  hasPassword: boolean;
  oneTimeView: boolean;
  viewCount: number;
}
