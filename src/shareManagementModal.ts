import { Modal, App, Notice } from 'obsidian';
import { ActiveShare } from './types';
import { ApiService } from './api';

export class ShareManagementModal extends Modal {
  private apiService: ApiService;
  private pluginId: string;

  constructor(app: App, apiService: ApiService, pluginId: string) {
    super(app);
    this.apiService = apiService;
    this.pluginId = pluginId;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Add custom modal styling
    this.modalEl.classList.add('secure-note-share-modal');

    contentEl.createEl('h2', { text: '📊 Active Share Management' });

    // Info section
    const infoSection = contentEl.createDiv({ cls: 'share-info' });
    infoSection.innerHTML = `
      <p>Manage your active secure note shares. You can revoke access to any shared note at any time.</p>
    `;    const historyFile = `.obsidian/plugins/${this.pluginId}/share-history.json`;
    let data: ActiveShare[] = [];

    try {
      const raw = await this.app.vault.adapter.read(historyFile);
      data = JSON.parse(raw) as ActiveShare[];
    } catch {
      const noHistoryContainer = contentEl.createDiv({ cls: 'share-warning' });
      noHistoryContainer.innerHTML = `
        <h4>📝 No Share History Found</h4>
        <p>You haven't created any secure shares yet. Start by sharing a note from the command palette or right-click menu.</p>
      `;
      return;
    }

    if (data.length === 0) {
      const noSharesContainer = contentEl.createDiv({ cls: 'share-info' });
      noSharesContainer.innerHTML = `
        <h4>✨ No Active Shares</h4>
        <p>All your previous shares have expired or been revoked. Create a new secure share to see it here.</p>
      `;
      return;
    }

    // Active shares header
    contentEl.createEl('h3', { text: `📋 Active Shares (${data.length})` });

    // Shares list
    const sharesContainer = contentEl.createDiv({ cls: 'shares-list' });

    data.forEach((share: ActiveShare) => {
      const container = sharesContainer.createDiv({ cls: 'share-management-item' });

      // Share info section
      const infoDiv = container.createDiv({ cls: 'share-item-info' });

      const titleEl = infoDiv.createEl('h4', { text: share.noteTitle, cls: 'share-item-title' });

      const detailsDiv = infoDiv.createDiv({ cls: 'share-item-details' });
      const createdDate = new Date(share.createdAt).toLocaleString();
      const expiresDate = new Date(share.expiresAt).toLocaleString();

      detailsDiv.createEl('div', { text: `📅 Created: ${createdDate}` });
      detailsDiv.createEl('div', { text: `⏰ Expires: ${expiresDate}` });

      if (share.hasPassword) {
        detailsDiv.createEl('div', { text: '🔑 Password protected', cls: 'share-feature-badge' });
      }

      // Action buttons
      const actionsDiv = container.createDiv({ cls: 'share-item-actions' });

      const revokeBtn = actionsDiv.createEl('button', {
        text: '🗑️ Revoke Access',
        cls: 'mod-warning share-revoke-btn'
      });

      revokeBtn.onclick = async () => {
        // Confirmation
        const confirmRevoke = confirm(`Are you sure you want to revoke access to "${share.noteTitle}"?\n\nThis action cannot be undone and the share link will immediately become invalid.`);

        if (!confirmRevoke) return;

        try {
          await this.apiService.revokeShare(share.id);
          new Notice(`✅ Access to "${share.noteTitle}" has been revoked successfully`);

          // Update local history
          const updated = data.filter(s => s.id !== share.id);
          await this.app.vault.adapter.write(
            historyFile,
            JSON.stringify(updated, null, 2)
          );          // Refresh the modal
          this.onOpen();
        } catch (error: any) {
          new Notice(`❌ Failed to revoke share: ${error.message}`);
        }
      };
    });

    // Action buttons
    const buttonContainer = contentEl.createDiv({ cls: 'share-button-container' });

    const closeBtn = buttonContainer.createEl('button', {
      text: '✅ Close',
      cls: 'mod-cta'
    });
    closeBtn.onclick = () => this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}
