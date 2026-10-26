import React from 'react';
import { useHeader } from '../useHeader';
import styles from '../Header.module.scss';

export const HeaderWeb: React.FC = () => {
  const { currentPath, navigateTo, statusInfo, isSyncing, isDbReady } = useHeader();

  return (
    <header className={styles.headerWeb}>
      <div className={styles.brand} onClick={() => navigateTo('/')}>
        <span className={styles.logo}>⚡</span>
        <span className={styles.title}>NoServer Barebones</span>
        {statusInfo?.dbType && (
          <span className={styles.badge}>{statusInfo.dbType}</span>
        )}
      </div>

      <nav className={styles.nav}>
        <button
          className={`${styles.navLink} ${currentPath === '/' ? styles.active : ''}`}
          onClick={() => navigateTo('/')}
        >
          Setup & Sync
        </button>
        <button
          className={`${styles.navLink} ${currentPath === '/explore' ? styles.active : ''}`}
          onClick={() => isDbReady && navigateTo('/explore')}
          disabled={!isDbReady}
          style={{
            opacity: isDbReady ? 1 : 0.4,
            cursor: isDbReady ? 'pointer' : 'not-allowed',
          }}
          title={isDbReady ? 'Explore database tables' : 'Setup database first to unlock explorer'}
        >
          <span>Database Explorer</span>
          {!isDbReady && <span style={{ fontSize: 10, marginLeft: 4 }}>🔒</span>}
        </button>
      </nav>

      <div className={styles.statusIndicator}>
        <span
          className={styles.dot}
          style={{
            backgroundColor: isSyncing ? '#fbbf24' : isDbReady ? '#34d399' : '#94a3b8',
          }}
        />
        <span>
          {isSyncing
            ? 'Syncing...'
            : isDbReady
            ? `${statusInfo?.tableCount ?? 0} Tables`
            : 'Database Not Ready'}
        </span>
      </div>
    </header>
  );
};
