# Gemini Knowledge Drive 🧠

A "Obsidian-like" Knowledge Base built on top of Google Drive. View, edit, and link Markdown files directly from your Google Shared Drives with a rich, local-first experience.

![Screenshot](public/screenshot.png)

## Features

- ⚡ **Local-First Speed**: Mirrors Drive metadata to IndexedDB for instant navigation.
- 🔗 **Wiki-Links**: Supports `[[WikiLinks]]` to connect knowledge nodes.
- 📝 **Rich Editor**: Monaco Editor (VS Code) integration with Vim keybindings support.
- 📊 **Graph View**: Force-directed graph visualization of your knowledge base.
- 🎨 **Obsidian Theme**: Beautiful dark mode typography and syntax highlighting.
- 🔐 **Secure**: Runs entirely client-side (Firebase Hosting) with direct Google Auth.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **State**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Editor**: Monaco Editor
- **Graph**: React Force Graph
- **Hosting**: Firebase Hosting

## Setup

### Prerequisites
- Node.js 20+
- Google Cloud Project with Drive API enabled

### Installation

1. Clone the repo
```bash
git clone https://github.com/your-org/gemini-knowledge-drive.git
cd gemini-knowledge-drive
```

2. Install dependencies
```bash
npm install
```

3. Configure Environment
Create `.env` based on `.env.example`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

4. Configure Google Cloud Console
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create or select an OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - Your production domain
   - Enable the Google Drive API

5. Run locally
```bash
npm run dev
```

## Deployment

1. **Build**:
```bash
npm run build
```

2. **Deploy to Firebase**:
```bash
npx firebase-tools deploy
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and patterns
- [Authentication](docs/AUTHENTICATION.md) - Google Sign-In implementation
- [Deployment](docs/DEPLOYMENT.md) - Firebase hosting setup
- [Styling](docs/STYLING.md) - Tailwind CSS v4 configuration
- [Error Handling](docs/ERROR_HANDLING.md) - Error handling patterns

## License

MIT
