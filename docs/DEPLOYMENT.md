# Deployment Guide

This application is deployed to Firebase Hosting.

## Prerequisites

- Node.js installed
- Firebase CLI (`npx firebase-tools` or `npm install -g firebase-tools`)
- Access to the Firebase project `drive-md-app-v1`

## Production URL

**https://drive-md-app-v1.web.app**

## Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Login to Firebase** (if not already authenticated)
   ```bash
   npx firebase-tools login
   ```

3. **Deploy**
   ```bash
   npx firebase-tools deploy
   ```

   Or if you have Firebase CLI installed globally:
   ```bash
   firebase deploy
   ```

## Environment Variables

The production build uses `.env.production` for environment variables. Key variables:

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

For local development, create a `.env` file (see `.env.example`).

## Google OAuth Configuration

The Google OAuth Client ID must have the following authorized origins configured in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

| Environment | Origin |
|-------------|--------|
| Production | `https://drive-md-app-v1.web.app` |
| Local Dev | `http://localhost:5173` |
| Preview | `http://localhost:4173` |

## Firebase Configuration

- **Project ID**: `drive-md-app-v1`
- **Hosting config**: `firebase.json`
- **Project reference**: `.firebaserc`

## Troubleshooting

### `redirect_uri_mismatch` error
The current origin is not registered in Google Cloud Console. Add it to the OAuth Client's authorized JavaScript origins.

### `VITE_GOOGLE_CLIENT_ID environment variable not set`
Create a `.env` file with your Google Client ID. See `.env.example`.

### Firebase permission denied
Run `npx firebase-tools login` to authenticate with an account that has access to the project.
