import { useState, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { useExplorerStore } from '../../store/useExplorerStore';
import { DEFAULT_SQLITE_GZ_URL } from '../../../backend/database/seeder';

export function useSyncSettings() {
  const {
    phase,
    statusInfo,
    isSyncing,
    isUploading,
    syncDatabase,
    uploadDatabase,
    refreshStatus,
  } = useSystemStore();
  const { fetchTables } = useExplorerStore();
  const [customUrl, setCustomUrl] = useState(statusInfo?.syncUrl || DEFAULT_SQLITE_GZ_URL);
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    if (phase === 'no_remote_url') {
      setShowPromptModal(true);
    } else if (phase === 'ready') {
      setShowPromptModal(false);
    }
  }, [phase]);

  const handleSync = async (urlToSync?: string) => {
    const target = urlToSync || customUrl;
    const success = await syncDatabase(target);
    if (success) {
      await refreshStatus();
      await fetchTables();
      setShowPromptModal(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const success = await uploadDatabase(file);
    if (success) {
      await refreshStatus();
      await fetchTables();
      setShowPromptModal(false);
    }
  };

  const handleResetUrl = () => {
    setCustomUrl(DEFAULT_SQLITE_GZ_URL);
  };

  return {
    phase,
    statusInfo,
    isSyncing,
    isUploading,
    customUrl,
    setCustomUrl,
    handleSync,
    handleFileUpload,
    handleResetUrl,
    showPromptModal,
    setShowPromptModal,
  };
}
