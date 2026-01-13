import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
}

interface NetworkActions {
  setOnline: (online: boolean) => void;
}

export type NetworkStore = NetworkState & NetworkActions;

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastOnlineAt: null,
  lastOfflineAt: null,

  setOnline: (online) =>
    set({
      isOnline: online,
      ...(online
        ? { lastOnlineAt: Date.now() }
        : { lastOfflineAt: Date.now() }),
    }),
}));

export function initializeNetworkListener(): () => void {
  const handleOnline = () => useNetworkStore.getState().setOnline(true);
  const handleOffline = () => useNetworkStore.getState().setOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function markOfflineFromApiFailure(): void {
  const state = useNetworkStore.getState();
  if (state.isOnline) {
    state.setOnline(false);
  }
}
