import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Menu } from 'obsidian';
import { SecureNoteShareSettings, DEFAULT_SETTINGS, ShareOptions } from './types';
import { ApiService } from './api';
import { ShareModal } from './shareModal';
import { ShareResultModal } from './shareResultModal';
import { ShareManagementModal } from './shareManagementModal';
import { SecureNoteShareSettingsTab } from './settings';

export default class SecureNoteSharePlugin extends Plugin {
  settings: SecureNoteShareSettings;
  apiService: ApiService;

  async onload() {
    console.log('Loading Secure Note Share Plugin');

    // Load settings
    await this.loadSettings();

    // API Service initialisieren
    this.apiService = new ApiService(this.settings);    // Commands registrieren
    this.addCommand({
      id: 'share-current-note',
      name: 'Share current note securely',
      checkCallback: (checking: boolean) => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && activeView.file) {
          if (!checking) {
            this.shareCurrentNote(activeView);
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'manage-shared-notes',
      name: 'Manage shared notes',
      callback: () => {
        this.openShareManagement();
      }
    });

    // Ribbon Icon hinzufügen
    const ribbonIconEl = this.addRibbonIcon('share', 'Share Note', (evt: MouseEvent) => {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeView) {
        this.shareCurrentNote(activeView);
      } else {
        new Notice('No active note found to share');
      }
    });
    // Ribbon Icon for Management
    this.addRibbonIcon('list', 'Manage shared notes', () => {
      new ShareManagementModal(this.app, this.apiService, this.manifest.id).open();
    });// Add context menu for files
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem((item) => {
            item
              .setTitle('Share Note')
              .setIcon('share')
              .onClick(async () => {
                const content = await this.app.vault.read(file);
                await this.shareNoteContent(content, file.basename, file.path);
              });
          });
          // Menu item for Share management
          menu.addSeparator();
          menu.addItem((item) => {
            item
              .setTitle('Manage shared Notes')
              .setIcon('list')
               .onClick(() => {
                new ShareManagementModal(this.app, this.apiService, this.manifest.id).open();
              });
          });
        }
      })
    );    // Add settings tab
    this.addSettingTab(new SecureNoteShareSettingsTab(this.app, this));

    // Server status check on startup
    this.checkServerConnection();
  }

  onunload() {
    console.log('Unloading Secure Note Share Plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.apiService.updateSettings(this.settings);
  }
  /**
   * Shares the currently opened note
   */
  async shareCurrentNote(view: MarkdownView) {
    const file = view.file;
    if (!file) {
      new Notice('No file found to share');
      return;
    }
    const content = view.getViewData();
    await this.shareNoteContent(content, file.basename, file.path);
  }
  /**
   * Shares note content with configurable options
   */
  async shareNoteContent(content: string, noteTitle: string, filePath?: string) {
    if (!content.trim()) {      new Notice('The note is empty and cannot be shared');
      return;
    }

    // Open Share-Modal for options
    new ShareModal(this.app, this.settings, async (options: ShareOptions) => {
      try {
        const loadingNotice = new Notice('Note is being encrypted and uploaded...', 0);

        // Add attachment inlining before upload
        let contentToUpload = content;
        if (options.includeAttachments && filePath) {
          contentToUpload = await this.inlineAttachments(content, filePath);
        }

        const result = await this.apiService.uploadNote(contentToUpload, options);        loadingNotice.hide();
        new Notice('Note shared successfully!');

        // Show result modal
        new ShareResultModal(this.app, result, noteTitle, this.apiService).open();

        // Save to local history (optional)
        await this.saveShareToHistory(result, noteTitle, options);

      } catch (error) {
        new Notice(`Error sharing: ${error.message}`);
        console.error('Share error:', error);
      }
    }).open();
  }  /**
   * Opens management for shared notes
   */
  openShareManagement() {
    // Open Share-Management-Modal
    new ShareManagementModal(this.app, this.apiService, this.manifest.id).open();
  }
  /**
   * Saves a shared note in the local history
   */
  async saveShareToHistory(result: any, noteTitle: string, options: ShareOptions) {
    try {
      const historyFile = `.obsidian/plugins/${this.manifest.id}/share-history.json`;
      let history = [];

      try {
        const existingData = await this.app.vault.adapter.read(historyFile);
        history = JSON.parse(existingData);
      } catch {
        // File doesn't exist yet
      }

      const shareEntry = {
        id: result.shareId,
        noteTitle,
        shareUrl: result.shareUrl,
        createdAt: Date.now(),
        expiresAt: result.expiresAt,
        ttlMinutes: options.ttlMinutes,
        hasPassword: !!options.password,
        oneTimeView: options.oneTimeView
      };

      history.unshift(shareEntry);

      // Keep only the last 50 entries
      if (history.length > 50) {
        history = history.slice(0, 50);
      }

      await this.app.vault.adapter.write(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving share history:', error);
    }
  }
  /**
   * Checks the connection to the server
   */
  async checkServerConnection() {
    try {
      const response = await fetch(`${this.settings.serverUrl}/health`);
      if (response.ok) {
        console.log('✅ Server connection successful');
      } else {
        new Notice('⚠️ Server reachable but not healthy. Check the configuration.');
      }
    } catch (error) {
      new Notice('❌ Server not reachable. Check the server URL in the settings.');
      console.error('Server connection failed:', error);
    }
  }

  // Add helper to inline attachments from local vault when requested
  private async inlineAttachments(content: string, filePath: string): Promise<string> {
    const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
    const pattern = /!\[\[([^|\]]+?)(?:\|.*?)?\]\]/g;
    let match;
    let newContent = content;
    while ((match = pattern.exec(content)) !== null) {
      const fileName = match[1];
      // Try multiple possible paths: relative, root, attachments folder
      const pathsToTry = [];
      if (dir) pathsToTry.push(`${dir}/${fileName}`);
      pathsToTry.push(fileName, `attachments/${fileName}`);
      let file: TFile | null = null;
      for (const p of pathsToTry) {
        const f = this.app.vault.getAbstractFileByPath(p);
        if (f instanceof TFile) { file = f; break; }
      }
      // If not found, search the entire vault for all matching filenames
      if (!file) {
        const allFiles = this.app.vault.getFiles();
        const matches = allFiles.filter(f => f.name === fileName);
        if (matches.length > 1) {
          console.warn(`[SecureNoteShare] Multiple files named '${fileName}' found. Using first match: ${matches[0].path}`);
        }
        file = matches[0] || null;
      }
      if (file) {
        // Read binary data and convert to base64
        const arrayBuffer = await this.app.vault.readBinary(file as any);
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        // Determine MIME type
        const ext = fileName.split('.').pop().toLowerCase();
        const mimeTypes: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif'
        };
        const mime = mimeTypes[ext] || 'application/octet-stream';
        const dataUri = `data:${mime};base64,${base64}`;
        // Replace wiki-link syntax with standard markdown image syntax
        newContent = newContent.replace(match[0], `![](${dataUri})`);
      }
    }
    return newContent;
  }
}
