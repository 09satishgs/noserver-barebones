import React from 'react';
import { useHeader } from '../useHeader';
import styles from '../Header.module.scss';

export const HeaderMobile: React.FC = () => {
  const { currentPath, navigateTo, statusInfo, isSyncing, isDbReady } = useHeader();

  return (
    <header className={styles.headerMobile}>
      <div className={styles.brand} onClick={() => navigateTo('/')}>
        <span className={styles.logo}>⚡</span>
        <span className={styles.brandTitle}>NoServer</span>
        {statusInfo?.dbType && (
          <span className={styles.badge}>{statusInfo.dbType}</span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.iconBtn} ${currentPath === '/' ? styles.active : ''}`}
          onClick={() => navigateTo('/')}
          title="Setup & Sync"
        >
          ⚙️
        </button>
        <button
          className={`${styles.iconBtn} ${currentPath === '/explore' ? styles.active : ''}`}
          onClick={() => isDbReady && navigateTo('/explore')}
          disabled={!isDbReady}
          title={isDbReady ? 'Explore' : 'Locked'}
          style={{ opacity: isDbReady ? 1 : 0.4 }}
        >
          📊
        </button>
        <span
          className={styles.dot}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isSyncing ? '#fbbf24' : isDbReady ? '#34d399' : '#94a3b8',
          }}
        />
      </div>
    </header>
  );
};
