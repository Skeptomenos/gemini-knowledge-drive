import { useAuth } from '@/features/auth';

export function Dashboard() {
  const { user, logout, isGapiReady } = useAuth();

  return (
    <div className="min-h-screen bg-gkd-bg text-gkd-text">
      <header className="border-b border-gkd-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gemini Knowledge Drive</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gkd-text-muted">{user.email}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-gkd-surface hover:bg-gkd-surface-hover border border-gkd-border rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gkd-surface rounded-lg p-6 border border-gkd-border">
            <h2 className="text-lg font-medium mb-4">Authentication Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">Logged in as:</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gkd-text-muted">gapi.client.drive:</span>
                <span className={isGapiReady ? 'text-green-400' : 'text-red-400'}>
                  {isGapiReady ? 'Available' : 'Not Ready'}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-gkd-text-muted text-sm">
            Phase 1 Complete - Authentication working. Ready for Phase 2: Data Engine.
          </p>
        </div>
      </main>
    </div>
  );
}
