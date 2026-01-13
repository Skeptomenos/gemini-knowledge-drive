import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { DriveSelector } from '@/features/drive';
import { useSync } from '@/hooks/useSync';

type WelcomeStep = 'welcome' | 'drive-selection' | 'syncing' | 'complete';

interface WelcomeFlowProps {
  onComplete: () => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const { accessToken } = useAuth();
  const { progress, startFullSync } = useSync();
  const [step, setStep] = useState<WelcomeStep>('welcome');
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  const handleGetStarted = () => {
    setStep('drive-selection');
  };

  const handleStartSync = async () => {
    if (!accessToken || !selectedDriveId) return;
    setStep('syncing');
    await startFullSync(accessToken, selectedDriveId);
    if (progress.status !== 'error') {
      setStep('complete');
    }
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gkd-bg">
      <div className="max-w-lg w-full mx-4">
        {step === 'welcome' && (
          <WelcomeScreen onContinue={handleGetStarted} />
        )}

        {step === 'drive-selection' && accessToken && (
          <DriveSelectionScreen
            accessToken={accessToken}
            selectedDriveId={selectedDriveId}
            onSelect={setSelectedDriveId}
            onBack={() => setStep('welcome')}
            onContinue={handleStartSync}
          />
        )}

        {step === 'syncing' && (
          <SyncProgressScreen
            filesProcessed={progress.filesProcessed}
            message={progress.message}
            status={progress.status}
          />
        )}

        {step === 'complete' && (
          <CompletionScreen onFinish={handleFinish} />
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="bg-gkd-surface rounded-lg p-8 border border-gkd-border text-center">
      <div className="text-5xl mb-6">📚</div>
      <h1 className="text-2xl font-bold mb-3">Welcome to Gemini Knowledge Drive</h1>
      <p className="text-gkd-text-muted mb-8 max-w-md mx-auto">
        Connect your Google Shared Drive to create an interlinked knowledge base.
        We'll index all your markdown files and enable powerful features like
        wikilinks, graph visualization, and full-text search.
      </p>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded-lg transition-colors text-lg font-medium"
      >
        Get Started
      </button>
    </div>
  );
}

interface DriveSelectionScreenProps {
  accessToken: string;
  selectedDriveId: string | null;
  onSelect: (driveId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function DriveSelectionScreen({
  accessToken,
  selectedDriveId,
  onSelect,
  onBack,
  onContinue,
}: DriveSelectionScreenProps) {
  return (
    <div className="bg-gkd-surface rounded-lg p-8 border border-gkd-border">
      <h2 className="text-xl font-bold mb-2">Select Your Knowledge Base</h2>
      <p className="text-gkd-text-muted mb-6">
        Choose a Shared Drive containing your markdown files. We'll index all
        .md files in this location.
      </p>

      <div className="mb-6">
        <DriveSelector
          accessToken={accessToken}
          onSelect={onSelect}
          selectedDriveId={selectedDriveId}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gkd-text-muted hover:text-gkd-text border border-gkd-border rounded transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedDriveId}
          className="flex-1 px-4 py-2 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Indexing
        </button>
      </div>
    </div>
  );
}

interface SyncProgressScreenProps {
  filesProcessed: number;
  message: string;
  status: string;
}

function SyncProgressScreen({ filesProcessed, message, status }: SyncProgressScreenProps) {
  const isError = status === 'error';

  return (
    <div className="bg-gkd-surface rounded-lg p-8 border border-gkd-border text-center">
      {!isError ? (
        <>
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-gkd-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold mb-2">Indexing Your Knowledge Base</h2>
          <p className="text-gkd-text-muted mb-4">{message || 'Connecting to Drive...'}</p>
          {filesProcessed > 0 && (
            <div className="text-2xl font-bold text-gkd-accent">
              {filesProcessed} files processed
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-5xl mb-6">❌</div>
          <h2 className="text-xl font-bold mb-2 text-red-400">Sync Failed</h2>
          <p className="text-gkd-text-muted">{message}</p>
        </>
      )}
    </div>
  );
}

function CompletionScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="bg-gkd-surface rounded-lg p-8 border border-gkd-border text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h2 className="text-2xl font-bold mb-3">Your Knowledge Base is Ready!</h2>
      <p className="text-gkd-text-muted mb-8 max-w-md mx-auto">
        All your markdown files have been indexed. You can now browse, search,
        and explore the connections between your notes.
      </p>
      <button
        onClick={onFinish}
        className="px-6 py-3 bg-gkd-accent hover:bg-gkd-accent-hover text-white rounded-lg transition-colors text-lg font-medium"
      >
        Open Dashboard
      </button>
    </div>
  );
}
