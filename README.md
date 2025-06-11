# 🔐 Obsidian Secure Note Share Plugin


Share your Obsidian notes securely with **end-to-end encryption** via unique links. Perfect for collaborating, sharing research, or distributing content while maintaining complete privacy and security.


> **🚧 Community Plugin Status**: This plugin is currently **under review** for the Obsidian Community Plugin Store. In the meantime, you can install it manually using the instructions below.


## 🌟 What is this plugin?

This plugin allows you to securely share individual notes from your Obsidian vault by:
- **Encrypting notes locally** before they leave your device
- **Generating unique share links** with separate decryption tokens
- **Setting expiration times** and access controls
- **Maintaining zero-knowledge** - the server cannot read your content

**🌐 Server Options**:

- **Default Service**: Works out-of-the-box with our hosted service
- **Self-Hosted** *(Optional)*: Run your own server using the [Obsidian Note Share Server](https://github.com/LonoxX/obsidian-note-share-server) for complete control



## ✨ Features

- **🔒 End-to-End Encryption** - Notes encrypted with AES-256-CTR before upload
- **🔗 Unique Share Links** - Each share gets its own link and decryption token
- **⏰ Time-Limited Access** - Set expiration times (1h, 6h, 24h, 7d, 30d, or unlimited)
- **🔐 Password Protection** - Add optional passwords for extra security
- **👁️ One-Time Viewing** - Links that self-destruct after first access
- **📎 Attachment Support** - Include linked images and files
- **🗂️ Share Management** - Overview and control of all your active shares
- **🌐 Cross-Platform** - Works on Desktop, Mobile, and Web versions of Obsidian
- **🛡️ Zero-Knowledge** - Server cannot decrypt your content



## 📥 Installation

### Option 1: Community Plugin Store (Recommended)

> **⏳ Coming Soon**: This plugin is currently under review for the official Obsidian Community Plugin Store.


1. Open Obsidian Settings
2. Go to **Community plugins** → **Browse**
3. Search for "**Secure Note Share**"
4. Click **Install** and then **Enable**

### Option 2: Manual Installation

1. **Download the latest release** from the [releases page](https://github.com/LonoxX/obsidian-note-share-plugin/releases)
2. **Extract the files** to your vault's plugin folder:

```
YourVault/.obsidian/plugins/obsidian-secure-note-share/
```

3. **Enable the plugin** in Obsidian:
   - Settings → Community plugins → Installed plugins
   - Find "Secure Note Share" and toggle it on


### Option 3: Development Build

1. **Clone the repository:**

```bash
git clone https://github.com/LonoxX/obsidian-note-share-plugin
cd obsidian-note-share-plugin/plugin
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build the plugin:**

```bash
npm run build
```


## ⚙️ Setup & Configuration

### Quick Start (Default Service)

The plugin works immediately after installation with our secure hosted service:
1. **Install the plugin** (see installation options above)
2. **Open Settings** → **Community plugins** → **Secure Note Share**
3. **Start sharing!** The default configuration is ready to use

### Advanced Setup (Self-Hosted Server)
For complete control over your data, you can run your own server:

1. **Set up your server** using the [Obsidian Note Share Server](https://github.com/LonoxX/obsidian-note-share-server)
2. **Configure plugin settings:**
   - Open **Settings** → **Community plugins** → **Secure Note Share**
   - Set your **Server URL** (e.g., `https://your-domain.com`)
   - Configure **Default TTL** (time-to-live for shares)


## 🚀 How to Use

  ### Sharing a Note


1. **Open any note** in Obsidian
2. **Use one of these methods:**
   - Click the 🔗 ribbon icon
   - Use Command Palette: "Share current note securely"
   - Right-click on a file → "Share securely"
3. **Configure share options:**
   - Set expiration time (1h to unlimited)
   - Add optional password
   - Choose if link should work only once
   - Include/exclude attachments
4. **Click "Generate link"**
5. **Share the link** and **decryption token** separately for maximum security
### Managing Shares

- Use the 📋 ribbon icon or command "Manage shared notes"
- View all active shares, their status, and expiration
- Revoke shares early if needed
## 🔒 Security & Privacy

### How it Works
1. **Local Encryption**: Your note is encrypted on your device using AES-256-CTR
2. **Secure Upload**: Only encrypted data is sent to the server
3. **Separate Tokens**: Decryption tokens are never sent to the server
4. **Zero-Knowledge**: The server cannot read your note content
### Security Features

- **AES-256-CTR Encryption** with random keys and IVs
- **PBKDF2 Password Derivation** (10,000 iterations) for password protection
- **Automatic Cleanup** of expired shares
- **No Plain Text Storage** - server only stores encrypted data
- **Minimal Metadata** - only necessary information is transmitted



## 🛠️ Development
### Prerequisites
- Node.js (version 16 or higher)
- npm
- *(Optional)* A self-hosted backend server
### Build Process

```bash
# Install dependencies
npm install

# build
npm run build
```


### Testing


1. Build the plugin: `npm run build`
2. Copy files to your test vault
3. Enable in Obsidian settings
4. Test with your backend server

## 📝 Commands & Hotkeys
The plugin registers these commands (assign hotkeys in Settings → Hotkeys):
- **Share current note securely** - Share the currently open note
- **Manage shared notes** - View and manage all active shares

## 🐛 Troubleshooting

### Common Issues

**"Server connection failed"**
- If using default service: Check your internet connection
- If self-hosting: Ensure the backend server is running
- Check the server URL in plugin settings
- Verify firewall and network settings

**"Encryption failed"**
- Update to the latest plugin version
- Check browser console for detailed errors
- Verify note content doesn't exceed size limits

**"Share link doesn't work"**
- Ensure you're providing both the link AND the decryption token
- Check if the share has expired
- Verify the password if one was set

### Getting Help

- 📚 Check the [server documentation](https://github.com/LonoxX/obsidian-note-share-server)
- 🐞 Report bugs on [GitHub Issues](https://github.com/LonoxX/obsidian-note-share-plugin/issues)
- 💬 Join the discussion in [GitHub Discussions](https://github.com/LonoxX/obsidian-note-share-plugin/discussions)
- 🎮 Join our [Discord community](https://pnnet.dev/discord) for support and help
## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
