import type {
  DriveFile,
  DriveListResponse,
  DriveChangesResponse,
  SharedDrive,
} from '@/types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

const MARKDOWN_MIME_TYPES = [
  'text/markdown',
  'text/x-markdown',
  'text/plain', // Some .md files are detected as text/plain
];

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

function buildMimeTypeQuery(): string {
  const mimeQueries = MARKDOWN_MIME_TYPES.map(
    (mime) => `mimeType='${mime}'`
  ).join(' or ');
  return `(${mimeQueries} or mimeType='${FOLDER_MIME_TYPE}')`;
}

async function driveRequest<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${DRIVE_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Drive API error: ${response.status}`
    );
  }

  return response.json();
}

export async function listSharedDrives(
  accessToken: string
): Promise<SharedDrive[]> {
  const response = await driveRequest<{ drives: SharedDrive[] }>(
    '/drives',
    accessToken,
    { pageSize: '100' }
  );
  return response.drives || [];
}

export async function listFiles(
  accessToken: string,
  driveId: string,
  pageToken?: string
): Promise<DriveListResponse> {
  const fields = 'nextPageToken, files(id, name, mimeType, parents, modifiedTime, version, trashed)';
  const q = `${buildMimeTypeQuery()} and trashed=false`;

  const params: Record<string, string> = {
    q,
    fields,
    pageSize: '1000',
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    corpora: 'drive',
    driveId,
  };

  if (pageToken) {
    params.pageToken = pageToken;
  }

  return driveRequest<DriveListResponse>('/files', accessToken, params);
}

export async function getStartPageToken(
  accessToken: string,
  driveId: string
): Promise<string> {
  const response = await driveRequest<{ startPageToken: string }>(
    '/changes/startPageToken',
    accessToken,
    {
      supportsAllDrives: 'true',
      driveId,
    }
  );
  return response.startPageToken;
}

export async function fetchChanges(
  accessToken: string,
  driveId: string,
  pageToken: string
): Promise<DriveChangesResponse> {
  const fields = 'nextPageToken, newStartPageToken, changes(fileId, removed, file(id, name, mimeType, parents, modifiedTime, version, trashed))';

  const params: Record<string, string> = {
    pageToken,
    fields,
    pageSize: '1000',
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    driveId,
    includeRemoved: 'true',
  };

  return driveRequest<DriveChangesResponse>('/changes', accessToken, params);
}

export interface FileContentResult {
  content: string;
  modifiedTime: string;
  version: string;
}

export async function getFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.status}`);
  }

  return response.text();
}

/**
 * Fetches file content along with metadata for concurrency detection.
 * Returns both the content and the modifiedTime to track when the file was loaded.
 */
export async function getFileContentWithMetadata(
  accessToken: string,
  fileId: string
): Promise<FileContentResult> {
  const [content, metadata] = await Promise.all([
    getFileContent(accessToken, fileId),
    getFileMetadata(accessToken, fileId),
  ]);

  return {
    content,
    modifiedTime: metadata.modifiedTime,
    version: metadata.version,
  };
}

export async function getFileMetadata(
  accessToken: string,
  fileId: string
): Promise<{ modifiedTime: string; version: string }> {
  return driveRequest<{ modifiedTime: string; version: string }>(
    `/files/${fileId}`,
    accessToken,
    {
      fields: 'modifiedTime,version',
      supportsAllDrives: 'true',
    }
  );
}

export async function updateFileContent(
  accessToken: string,
  fileId: string,
  content: string
): Promise<{ modifiedTime: string; version: string }> {
  const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
  const url = `${UPLOAD_API_BASE}/files/${fileId}?uploadType=media&supportsAllDrives=true`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/markdown',
    },
    body: content,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to update file: ${response.status}`
    );
  }

  const result = await response.json();
  return {
    modifiedTime: result.modifiedTime,
    version: result.version,
  };
}

export function isMarkdownFile(file: DriveFile): boolean {
  if (MARKDOWN_MIME_TYPES.includes(file.mimeType)) {
    return true;
  }
  // Also check file extension for text/plain files
  if (file.mimeType === 'text/plain' && file.name.endsWith('.md')) {
    return true;
  }
  return false;
}

export function isFolder(file: DriveFile): boolean {
  return file.mimeType === FOLDER_MIME_TYPE;
}
