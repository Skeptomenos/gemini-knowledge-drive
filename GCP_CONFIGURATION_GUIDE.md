# Google Cloud Platform (GCP) Configuration Guide
## Gemini Knowledge Drive

This document lists all the configuration values required to deploy and publish the application.

---

## 1. APIs & Services > Credentials

### OAuth 2.0 Client IDs
*   **Application Type**: Web application
*   **Name**: Gemini Knowledge Drive Web Client
*   **Authorized JavaScript Origins**:
    *   `https://drive-md-app-v1.web.app`
    *   `http://localhost:5173` (Optional, for local dev)
*   **Authorized Redirect URIs**:
    *   `https://drive-md-app-v1.web.app`
    *   `http://localhost:5173` (Optional)

---

## 2. APIs & Services > Google Drive API > Drive UI Integration

### Application Information
*   **Application Name**: Gemini Knowledge Drive
*   **Short Description**: Markdown Knowledge Base
*   **Long Description**: Internal tool for viewing and editing Markdown files in Shared Drives.
*   **Application Icon**: (Upload 128x128 PNG)

### Drive Integration
*   **Open URL**: `https://drive-md-app-v1.web.app/`
*   **Default MIME types**:
    *   `text/markdown`
    *   `text/x-markdown`
    *   `text/plain`
*   **Default file extensions**:
    *   `md`
    *   `markdown`
*   **Creating files**: (Unchecked - unless you want "New > Markdown File" feature later)
*   **Importing**: ☑️ Checked (Critical for opening existing files)

---

## 3. APIs & Services > Google Workspace Marketplace SDK > App Configuration

### App Integration
*   **Google Workspace Add-on**: ☐ Unchecked
*   **Apps Script**: ☐ Unchecked
*   **Web app**: ☑️ Checked
    *   **Universal Nav URL**: `https://drive-md-app-v1.web.app/`
*   **Drive app**: ☑️ Checked
    *   (Inherits settings from Drive UI Integration)

### OAuth Scopes
(Copy and paste this list exactly)
```text
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.install
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

### Developer Information
*   **Developer Name**: IT Services
*   **Developer Website**: `https://drive-md-app-v1.web.app/`
*   **Developer Email**: `david.helmus@hellofresh.com`

---

## 4. APIs & Services > Google Workspace Marketplace SDK > Store Listing

### App Details
*   **Application Name**: Gemini Knowledge Drive
*   **Short Description**: Markdown Knowledge Base for Drive
*   **Full Description**: Internal tool for viewing and editing Markdown files with wiki-linking, graph view, and rich preview.
*   **Category**: Productivity

### Graphics Assets
*   **Application Icon (128x128)**: (Upload PNG)
*   **Card Banner (220x140)**: (Upload PNG - use any placeholder if needed)
*   **Marquee Image (1024x500)**: (Upload PNG - use a screenshot or placeholder)
*   **Screenshots**: (Upload at least 1)

### Support Links
*   **Terms of Service URL**: `https://drive-md-app-v1.web.app/`
*   **Privacy Policy URL**: `https://drive-md-app-v1.web.app/`
*   **Support URL**: `https://drive-md-app-v1.web.app/`

---

## 5. Publishing (Marketplace SDK)

*   **Visibility**: Private (Available only to users in your domain)
*   **Installation Settings**:
    *   **Individual Install**: Allowed
    *   **Admin Install**: Allowed
*   **Click PUBLISH**.
