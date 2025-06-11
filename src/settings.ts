import { PluginSettingTab, App, Setting } from 'obsidian';
import SecureNoteSharePlugin from './main';

export class SecureNoteShareSettingsTab extends PluginSettingTab {
  plugin: SecureNoteSharePlugin;

  constructor(app: App, plugin: SecureNoteSharePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Plugin Header
    containerEl.createEl('h1', { text: '🔐 Secure Note Share' });
      // Overview Section
    const overview = containerEl.createDiv({ cls: 'setting-item-description' });
    overview.innerHTML = `
      <div style="background: var(--background-secondary); border: 1px solid var(--color-green); padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid var(--color-green);">
        <strong style="color: var(--color-green); font-size: 1em;">✨ Key Features:</strong>
        <span style="color: var(--text-normal); font-weight: 500;">End-to-end encryption • Password protection • Automatic expiration • View limits • Self-hosting support</span>
      </div>
    `;

    // Security Information Section
    containerEl.createEl('h2', { text: '🔒 Security & Privacy' });    const securityInfo = containerEl.createDiv({ cls: 'setting-item-description' });    securityInfo.innerHTML = `
      <div style="background: var(--background-secondary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>🛡️ End-to-End Encryption:</strong> Your notes are encrypted locally using AES-256-CTR before transmission. The server never sees your unencrypted content.</p>
        <p><strong>🔑 Zero-Knowledge Architecture:</strong> Decryption tokens are generated client-side and never stored on the server. Only you and your recipient have access.</p>
        <p><strong>⏱️ Automatic Cleanup:</strong> Shared notes are automatically deleted when they expire or reach their view limit.</p>
        <p><strong>🔐 Optional Password Protection:</strong> Add an extra layer of security with password protection for sensitive content.</p>
      </div>
    `;

    // Server Configuration Section
    containerEl.createEl('h2', { text: '🌐 Server Configuration' });    new Setting(containerEl)
      .setName('Server URL')
      .setDesc('Configure the endpoint for your secure note sharing service. Use our trusted hosted service for convenience, or deploy your own self-hosted instance for complete data sovereignty and enhanced privacy control. Custom domains are supported.')
      .addText(text => text
        .setPlaceholder('https://secure-notes.example.com')
        .setValue(this.plugin.settings.serverUrl)
        .onChange(async (value) => {
          this.plugin.settings.serverUrl = value;
          await this.plugin.saveSettings();
        }));

    // Sharing Defaults Section
    containerEl.createEl('h2', { text: '⚙️ Default Share Settings' });    new Setting(containerEl)
      .setName('Default Validity Duration')
      .setDesc('Set the default lifespan for shared links before they automatically expire. Individual shares can override this setting. Shorter durations enhance security by minimizing exposure time, while longer durations offer convenience for persistent sharing needs.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('60', '1 hour ')
          .addOption('360', '6 hours')
          .addOption('1440', '1 day')
          .addOption('10080', '1 week')
          .addOption('43200', '1 month')
          .setValue(this.plugin.settings.defaultTtlMinutes.toString())
          .onChange(async (value) => {
            this.plugin.settings.defaultTtlMinutes = parseInt(value);
            await this.plugin.saveSettings();
          });      });

    // Help & Support Section
    containerEl.createEl('h2', { text: '❓ Help & Support' });

    const helpSection = containerEl.createDiv({ cls: 'setting-item-description' });
    helpSection.innerHTML = `
      <div style="background: var(--background-secondary); padding: 15px; border-radius: 8px;">
        <p><strong>📚 Documentation:</strong> Find detailed setup guides and troubleshooting at our <a href="https://github.com/LonoxX/obsidian-note-share-plugin" target="_blank">GitHub repository</a>.</p>
        <p><strong>🔧 Self-Hosting:</strong> Want complete control? Deploy your own server using our Docker images or Node.js setup.</p>
        <p><strong>🐛 Issues & Feedback:</strong> Report bugs or request features on our <a href="https://github.com/LonoxX/obsidian-note-share-plugin/issues" target="_blank">GitHub issues page</a>.</p>
        <p><strong>💬 Support Discord:</strong> Join our <a href="https://pnnet.dev/discord" target="_blank">Discord server</a> for help, discussions.</p>
      </div>
    `;
  }
}
