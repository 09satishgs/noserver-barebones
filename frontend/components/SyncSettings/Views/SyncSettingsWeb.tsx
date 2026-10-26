import React, { useRef } from 'react';
import { useSyncSettings } from '../useSyncSettings';
import { Modal } from '../../Modal';
import styles from '../SyncSettings.module.scss';

export const SyncSettingsWeb: React.FC = () => {
  const {
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
  } = useSyncSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Database Setup & Synchronization</h1>
        <p className={styles.subtitle}>
          Configure, synchronize, or directly upload the browser's local SQLite-WASM OPFS database.
        </p>
      </div>

      {/* 1. TOP CARD: Remote Database Synchronization */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>
          <span>🔄</span> Remote Database Synchronization
        </div>
        <div className={styles.syncForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="sync-url">Remote SQLite GZ Archive URL:</label>
            <input
              id="sync-url"
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/database.sqlite.gz"
              disabled={isSyncing || isUploading}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              onClick={() => handleSync()}
              disabled={isSyncing || isUploading || !customUrl.trim()}
            >
              <span>{isSyncing ? '⏳' : '⚡'}</span>
              <span>{isSyncing ? 'Synchronizing Archive...' : 'Download & Initialize Database'}</span>
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={handleResetUrl}
              disabled={isSyncing || isUploading}
            >
              Reset URL
            </button>
          </div>

          <p className={styles.hint}>
            Downloads the remote compressed SQLite database, extracts it via the in-browser Web Worker, and persists it to OPFS.
          </p>
        </div>
      </div>

      {/* 2. MIDDLE CARD: Direct File Upload (Bypasses Download) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>
          <span>📁</span> Direct Local Database Upload
        </div>
        <div
          className={styles.uploadZone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className={styles.uploadIcon}>{isUploading ? '⏳' : '📥'}</div>
          <div className={styles.uploadTitle}>
            {isUploading ? 'Importing database to OPFS...' : 'Click to select or drag & drop database file'}
          </div>
          <div className={styles.uploadSub}>
            Supports raw SQLite files (.sqlite, .db) and compressed archives (.sqlite.gz)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sqlite,.db,.sqlite.gz,.gz"
            className={styles.hiddenInput}
            onChange={onFileChange}
          />
        </div>
      </div>

      {/* 3. BOTTOM CARD: Storage Engine Status */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>
          <span>📊</span> Storage Engine Status
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.label}>VFS Storage Mode</div>
            <div className={styles.value}>{statusInfo?.dbType}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.label}>Total Entities</div>
            <div className={styles.value}>{statusInfo?.characterCount ?? 0}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.label}>Database Tables</div>
            <div className={styles.value}>{statusInfo?.tableCount ?? 0}</div>
          </div>
        </div>

        {statusInfo?.tables && statusInfo.tables.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
              Discovered SQLite Schema Tables:
            </div>
            <div className={styles.tablesList}>
              {statusInfo.tables.map((t) => (
                <span key={t} className={styles.tablePill}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prompt Modal when No Remote URL in .env */}
      {showPromptModal && (
        <Modal
          title="Setup In-Browser Database"
          onClose={() => setShowPromptModal(false)}
        >
          <div className={styles.modalPrompt}>
            <p className={styles.promptDesc}>
              No remote database URL was found in your environment configuration. Choose an option to initialize your local browser database:
            </p>

            <div className={styles.syncForm}>
              <div className={styles.inputGroup}>
                <label>1. Provide a Remote Database URL (.sqlite.gz):</label>
                <input
                  type="text"
                  placeholder="https://.../fefw.sqlite.gz"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
              <button
                className={styles.primaryBtn}
                onClick={() => handleSync()}
                disabled={isSyncing || !customUrl.trim()}
              >
                {isSyncing ? 'Downloading...' : 'Fetch & Mount'}
              </button>
            </div>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <div>
              <button
                className={styles.secondaryBtn}
                style={{ width: '100%', padding: '12px' }}
                onClick={() => modalFileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : '📁 Upload Local .sqlite or .sqlite.gz File'}
              </button>
              <input
                ref={modalFileInputRef}
                type="file"
                accept=".sqlite,.db,.sqlite.gz,.gz"
                className={styles.hiddenInput}
                onChange={onFileChange}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
