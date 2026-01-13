# Implementation Run 1: Foundation & Authentication

## 1. Goal
Initialize the project structure, configure the build system, set up Firebase Hosting, and implement the Google OAuth 2.0 Identity layer. By the end of this run, a user should be able to log in with their Google Account, and the app should possess a valid Access Token ready for API calls.

## 2. Dependencies
*   `vite` (React + TypeScript + SWC)
*   `firebase`
*   `react-router-dom`
*   `tailwindcss` + `postcss` + `autoprefixer`
*   `lucide-react` (Icons)
*   `clsx`, `tailwind-merge` (Utils)

## 3. Files to Create

### Infrastructure
*   `package.json`: Dependencies and scripts.
*   `vite.config.ts`: Path aliases (`@/*`).
*   `tsconfig.json`: Strict mode.
*   `tailwind.config.js`: Dark mode config, color palette.
*   `firebase.json`: Hosting rewrites.

### Application Core
*   `src/main.tsx`: Entry point.
*   `src/App.tsx`: Auth Gate wrapper.
*   `src/lib/firebase.ts`: Firebase initialization.
*   `src/lib/google-auth.ts`: 
    *   Functions to load `gapi` script.
    *   Functions to initialize `google.accounts.oauth2`.
*   `src/contexts/AuthContext.tsx`:
    *   React Context provider.
    *   State: `user` (User profile), `accessToken` (string), `isLoading` (bool), `isAuthenticated` (bool).
    *   Methods: `login()`, `logout()`.
*   `src/pages/Login.tsx`: Minimal login screen with "Sign in with Google" button.
*   `src/pages/Dashboard.tsx`: Placeholder protected route.

## 4. Key Logic (Auth)
The auth flow must handle the "Internal App" constraints:
1.  **Script Loading**: Async load `https://accounts.google.com/gsi/client` and `https://apis.google.com/js/api.js`.
2.  **Token Client**: Initialize `initTokenClient` with `scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.install'`.
3.  **Discovery**: Initialize `gapi.client.init` with `discoveryDocs`.
4.  **Persistence**: Do **NOT** store the access token in localStorage. Store it in React state. If the page reloads, trigger a silent prompt (or redirect to login) to re-acquire.

## 5. Verification Steps
1.  `npm run dev` starts the server.
2.  User sees Login page.
3.  Clicking Login opens Google Popup.
4.  After consent, user is redirected to Dashboard.
5.  Console logs show "Token received: ya29..." (for debugging).
6.  `gapi.client.drive` is available in the console.
