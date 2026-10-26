import React, { useRef } from 'react';
import { useSyncSettings } from '../useSyncSettings';
import { Modal } from '../../Modal';
import styles from '../SyncSettings.module.scss';

export const SyncSettingsMobile: React.FC = () => {
  const {
    statusInfo,
    isSyncing,
    isUploading,
    customUrl,
    setCustomUrl,
    handleSync,
    handleFileUpload,
    showPromptModal,
    setShowPromptModal,
  } = useSyncSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Database Setup</h2>
      </div>

      {/* 1. TOP CARD: Remote Sync */}
      <div className={styles.sectionCard}>
        <div className={styles.syncForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="sync-url-mobile">Archive URL (.sqlite.gz):</label>
            <input
              id="sync-url-mobile"
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              disabled={isSyncing || isUploading}
            />
          </div>

          <button
            className={styles.primaryBtn}
            onClick={() => handleSync()}
            disabled={isSyncing || isUploading || !customUrl.trim()}
          >
            {isSyncing ? 'Synchronizing...' : 'Download & Initialize'}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE CARD: File Upload */}
      <div className={styles.sectionCard}>
        <button
          className={styles.secondaryBtn}
          style={{ width: '100%', padding: '12px' }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSyncing}
        >
          {isUploading ? 'Importing file...' : '📁 Upload .sqlite / .sqlite.gz File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sqlite,.db,.sqlite.gz,.gz"
          className={styles.hiddenInput}
          onChange={onFileChange}
        />
      </div>

      {/* 3. BOTTOM CARD: Status */}
      <div className={styles.sectionCard}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.label}>Storage</div>
            <div className={styles.value}>{statusInfo?.dbType}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.label}>Entities</div>
            <div className={styles.value}>{statusInfo?.characterCount ?? 0}</div>
          </div>
        </div>
      </div>

      {showPromptModal && (
        <Modal
          title="Setup In-Browser Database"
          onClose={() => setShowPromptModal(false)}
        >
          <div className={styles.modalPrompt}>
            <p className={styles.promptDesc}>
              No remote URL found. Enter a URL or upload a database file:
            </p>
            <input
              type="text"
              placeholder="https://.../fefw.sqlite.gz"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                padding: '10px',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <button
              className={styles.primaryBtn}
              onClick={() => handleSync()}
              disabled={isSyncing || !customUrl.trim()}
            >
              Fetch & Mount
            </button>
            <div className={styles.divider}>
              <span>OR</span>
            </div>
            <button
              className={styles.secondaryBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Local File
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
