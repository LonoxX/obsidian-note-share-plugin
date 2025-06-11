import { Modal, App, Setting, ButtonComponent, TextComponent } from 'obsidian';
import { ShareOptions, SecureNoteShareSettings } from './types';

export class ShareModal extends Modal {
  private settings: SecureNoteShareSettings;
  private onSubmit: (options: ShareOptions) => Promise<void>;  private options: ShareOptions = {
    ttlMinutes: 60,
    oneTimeView: false,
    includeAttachments: true // Enabled by default
  };

  constructor(app: App, settings: SecureNoteShareSettings, onSubmit: (options: ShareOptions) => Promise<void>) {
    super(app);
    this.settings = settings;
    this.onSubmit = onSubmit;
    this.options.ttlMinutes = settings.defaultTtlMinutes;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Add custom modal styling
    this.modalEl.classList.add('secure-note-share-modal');

    // Header
    contentEl.createEl('h2', { text: '🔐 Share Note' });
    // Wrap settings in grid layout
    const optionsGrid = contentEl.createDiv({ cls: 'share-options-grid' });

    // Validity duration
    new Setting(optionsGrid)
      .setName('⏱️ Validity Duration')
      .setDesc('How long the share link remains active. Shorter durations provide better security by limiting exposure time.')
      .addDropdown(dropdown => {
        dropdown
          .addOption('60', '1 hour')
          .addOption('360', '6 hours')
          .addOption('1440', '1 day')
          .addOption('10080', '1 week')
          .addOption('43200', '1 month')
          .addOption('-1', 'Unlimited (Least Secure)')
          .setValue(this.settings.defaultTtlMinutes.toString())
          .onChange(value => {
            this.options.ttlMinutes = parseInt(value);
          });
      });

    // Password (optional)
    let passwordInput: TextComponent;
    new Setting(optionsGrid)
      .setName('🔑 Password Protection (Optional)')
      .setDesc('Add an extra layer of security. Recipients will need both the link and this password to decrypt the note.')
      .addText(text => {
        passwordInput = text;
        text
          .setPlaceholder('Enter a strong password...')
          .onChange(value => {
            this.options.password = value || undefined;
          });
      });

    // Show only once
    new Setting(optionsGrid)
      .setName('👁️ View Once Only')
      .setDesc('Automatically destroy the note after the first viewing for maximum security. Perfect for sensitive information.')
      .addToggle(toggle => {
        toggle
          .setValue(false)
          .onChange(value => {
            this.options.oneTimeView = value;
          });
      });

    // Include attachments
    new Setting(optionsGrid)
      .setName('📎 Include Attachments')
      .setDesc('Upload and encrypt linked images and files with the note. Larger files may take longer to process.')
      .addToggle(toggle => {
        toggle
          .setValue(true) // Enabled by default
          .onChange(value => {
            this.options.includeAttachments = value;
          });
      });

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'share-button-container' });

    const cancelBtn = new ButtonComponent(buttonContainer)
      .setButtonText('Cancel')
      .onClick(() => { this.close(); });
    cancelBtn.buttonEl.classList.add('share-button-secondary');

    const generateBtn = new ButtonComponent(buttonContainer)
      .setButtonText('🚀 Generate Secure Link')
      .setCta()
      .onClick(async () => {
        try {
          await this.onSubmit(this.options);
          this.close();
        } catch (error) {
          console.error('Error sharing note:', error);
          // Error handling will be done in the main plugin
        }
      });
    generateBtn.buttonEl.classList.add('share-button-primary');
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
