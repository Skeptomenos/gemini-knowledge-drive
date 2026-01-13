import { useState, useEffect } from 'react';
import { listSharedDrives } from './api';
import type { SharedDrive } from '@/types';

interface DriveSelectorProps {
  accessToken: string;
  onSelect: (driveId: string) => void;
  selectedDriveId?: string | null;
}

export function DriveSelector({
  accessToken,
  onSelect,
  selectedDriveId,
}: DriveSelectorProps) {
  const [drives, setDrives] = useState<SharedDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrives() {
      try {
        setLoading(true);
        setError(null);
        const sharedDrives = await listSharedDrives(accessToken);
        setDrives(sharedDrives);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drives');
      } finally {
        setLoading(false);
      }
    }

    fetchDrives();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gkd-text-muted">
        <div className="w-4 h-4 border-2 border-gkd-accent border-t-transparent rounded-full animate-spin" />
        <span>Loading shared drives...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        Error: {error}
      </div>
    );
  }

  if (drives.length === 0) {
    return (
      <div className="text-gkd-text-muted text-sm">
        No shared drives found. Make sure you have access to at least one shared drive.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gkd-text">
        Select a Shared Drive
      </label>
      <select
        value={selectedDriveId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 bg-gkd-surface border border-gkd-border rounded text-gkd-text focus:outline-none focus:ring-2 focus:ring-gkd-accent"
      >
        <option value="">Choose a drive...</option>
        {drives.map((drive) => (
          <option key={drive.id} value={drive.id}>
            {drive.name}
          </option>
        ))}
      </select>
    </div>
  );
}
