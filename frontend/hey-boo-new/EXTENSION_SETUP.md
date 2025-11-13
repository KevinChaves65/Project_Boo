# Hey Boo Chrome Extension - Build & Installation Guide

## Prerequisites
- Node.js and npm installed
- Chrome browser
- Hey Boo backend server running on localhost:8080

## Build Process

### 1. Navigate to the frontend directory
```bash
cd C:\Academic\Capstone\Project_Boo\frontend\hey-boo-new
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the extension
```bash
npm run build:extension
```

This will:
- Build the Vue.js app with Vite
- Copy all necessary extension files to the `dist/` folder
- Prepare the extension for installation

### 4. Package for distribution (optional)
```bash
npm run package:extension
```

This creates `hey-boo-extension.zip` for sharing or Chrome Web Store upload.

## Installation in Chrome

### 1. Open Chrome Extensions
- Open Chrome browser
- Navigate to `chrome://extensions/`
- Or go to Chrome menu → More Tools → Extensions

### 2. Enable Developer Mode
- Toggle "Developer mode" switch in the top right corner

### 3. Load the Extension
- Click "Load unpacked" button
- Navigate to `C:\Academic\Capstone\Project_Boo\frontend\hey-boo-new\dist\`
- Select the `dist` folder
- Click "Select Folder"

### 4. Verify Installation
- The Hey Boo extension should appear in your extensions list
- You should see the Hey Boo icon in the Chrome toolbar
- Try clicking the icon to open the app

## Features

### ✅ **Chrome Extension Features**
- **Popup Interface**: Click the extension icon to open the full Hey Boo app
- **Floating Button**: Appears on all websites for quick access
- **Content Detection**: Button highlights on relationship-related content
- **Chrome Storage**: Syncs login state and data across devices
- **Background Service**: Handles extension lifecycle and messaging
- **Cross-Platform**: Same codebase works as web app and extension

### 📱 **App Features Available in Extension**
- User authentication and profiles
- Couple linking and management
- Real-time chat with themed word suggestions
- Date idea generation and saving
- Calendar integration and milestone tracking
- All existing Hey Boo functionality

## Configuration

### Backend Setup
Make sure your backend server is running:
```bash
cd C:\Academic\Capstone\Project_Boo\backend
go run main.go
```

The extension is configured to connect to `http://localhost:8080`

### API Endpoints
The extension uses the same API endpoints as the web app:
- Authentication: `POST /login`, `POST /register`
- Profile: `GET /auth/profile`
- Chat: `POST /auth/chat/send`, `GET /auth/chat/receive`
- Date Ideas: `POST /auth/dateideas/generate`
- And all other existing endpoints...

## Troubleshooting

### Extension Not Loading
1. Check that all files are in the `dist/` folder
2. Verify `manifest.json` is valid JSON
3. Check Chrome Developer Console for errors

### API Connection Issues
1. Ensure backend server is running on localhost:8080
2. Check CORS configuration in backend
3. Verify network connectivity

### Authentication Problems
1. Clear extension storage: Chrome → Settings → Privacy → Site Settings → Chrome Extension → Hey Boo → Clear Data
2. Check token storage in Chrome Extension storage
3. Re-login through the extension

### Content Script Not Working
1. Check Chrome Extensions page for permission warnings
2. Reload the extension after changes
3. Check browser console on web pages for errors

## Development

### Making Changes
1. Modify source files in `src/`
2. Run `npm run build:extension`
3. Reload extension in Chrome (click refresh icon in extensions page)

### Debugging
- **Extension Popup**: Right-click extension icon → Inspect popup
- **Background Script**: Chrome Extensions page → Details → Inspect background page
- **Content Script**: Browser Developer Tools → Console (on any webpage)

## File Structure
```
dist/
├── index.html              # Extension popup
├── manifest.json           # Extension configuration
├── background.js           # Background service worker
├── content.js              # Content script (floating button)
├── assets/                 # Compiled Vue.js app
├── icons/                  # Extension icons
└── images/                 # App images
```

## Distribution

### Chrome Web Store
1. Create developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Package extension: `npm run package:extension`
3. Upload `hey-boo-extension.zip`
4. Fill out store listing details
5. Submit for review

### Manual Distribution
Share the `hey-boo-extension.zip` file with users for manual installation.

---

🎉 **Your Hey Boo app is now a fully functional Chrome extension!** 

The extension provides the same great relationship management features in a convenient browser extension format, accessible from any webpage with the floating button or by clicking the extension icon.