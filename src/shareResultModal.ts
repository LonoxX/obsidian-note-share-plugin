import { Modal, App, Setting, ButtonComponent, Notice } from 'obsidian';
import { ShareResult } from './types';
import { ApiService } from './api';

export class ShareResultModal extends Modal {
  private apiService: ApiService;
  private shareResult: ShareResult;
  private noteTitle: string;

  constructor(app: App, shareResult: ShareResult, noteTitle: string, apiService: ApiService) {
    super(app);
    this.shareResult = shareResult;
    this.noteTitle = noteTitle;
    this.apiService = apiService;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Add custom modal styling
    this.modalEl.classList.add('secure-note-share-modal');

    contentEl.createEl('h2', { text: '🎉 Secure Share Link Created!' });

    // Success info
    const successInfo = contentEl.createDiv({ cls: 'share-info' });
    successInfo.innerHTML = `
      <p>Your note <strong>"${this.noteTitle}"</strong> has been encrypted and is ready to share.
      The link below contains everything needed for secure access.</p>
    `;

    // Share link section
    const linkContainer = contentEl.createDiv({ cls: 'share-result-container' });
    linkContainer.createEl('h3', { text: '🔗 Secure Share Link' });

    const linkDescription = linkContainer.createEl('p', { cls: 'setting-item-description' });
    linkDescription.textContent = 'This link contains the decryption token and can be shared directly. Recipients can access the note immediately.';

    const linkInputContainer = linkContainer.createDiv({ cls: 'share-input-container' });
    const linkInput = linkInputContainer.createEl('input', {
      type: 'text',
      value: this.shareResult.shareUrl,
      cls: 'share-input'
    });
    linkInput.readOnly = true;

    const copyLinkButton = linkInputContainer.createEl('button', {
      text: '📋 Copy Link',
      cls: 'mod-cta share-copy-button'
    });
    copyLinkButton.onclick = () => {
      navigator.clipboard.writeText(this.shareResult.shareUrl);
      new Notice('✅ Share link copied to clipboard!');
    };    // Copy all information button
    const copyAllButton = contentEl.createEl('button', {
      text: '📄 Copy Share Information',
      cls: 'mod-cta share-copy-all-button'
    });copyAllButton.onclick = () => {
      const expiryDate = new Date(this.shareResult.expiresAt).toLocaleString();
      const allInfo = `
🔐 Secure Note Share: "${this.noteTitle}"

🔗 Share Link:
${this.shareResult.shareUrl}
⏰ Link expires: ${expiryDate}
      `.trim();

      navigator.clipboard.writeText(allInfo);
      new Notice('✅ Share information copied to clipboard!');
    };

    // Expiry and security info section
    const infoContainer = contentEl.createDiv({ cls: 'share-result-container' });
    const expiryDate = new Date(this.shareResult.expiresAt);

    infoContainer.createEl('h3', { text: '📋 Share Details' });
    const infoList = infoContainer.createEl('ul');
    infoList.createEl('li', { text: `⏰ Valid until: ${expiryDate.toLocaleString()}` });

    // Action buttons
    const buttonContainer = contentEl.createDiv({ cls: 'share-button-container' });

    const closeBtn = new ButtonComponent(buttonContainer)
      .setButtonText('✅ Done')
      .onClick(() => { this.close(); });
    closeBtn.buttonEl.classList.add('share-button-secondary');

    const revokeBtn = new ButtonComponent(buttonContainer)
      .setButtonText('🗑️ Revoke Share')
      .onClick(async () => {
        try {
          await this.apiService.revokeShare(this.shareResult.shareId);
          new Notice('🗑️ Share link has been revoked and is no longer accessible!');
          this.close();
        } catch (e) {
          new Notice('❌ Error revoking share: ' + e.message);
        }
      });
    revokeBtn.buttonEl.classList.add('share-button-primary');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
