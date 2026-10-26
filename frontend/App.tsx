import React, { useEffect } from 'react';
import { useSystemStore } from './store/useSystemStore';
import { Routing } from './layout/Routing';
import styles from './App.module.scss';

export const App: React.FC = () => {
  const { phase, progressText, initApp } = useSystemStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Show progress screen only while actively downloading or decompressing
  if (phase === 'downloading' || phase === 'extracting') {
    return (
      <div className={styles.initScreen}>
        <div className={styles.initCard}>
          <div className={styles.logo}>⚡</div>
          <h2 className={styles.title}>Initializing Browser Server</h2>
          <p className={styles.subtitle}>
            Downloading SQLite database archive, decompressing gzip stream, and mounting OPFS VFS in Web Worker...
          </p>

          <div className={styles.spinner} />
          <div className={styles.progressText}>{progressText}</div>
        </div>
      </div>
    );
  }

  // In all other phases (ready, no_remote_url, idle, or error), render Routing where the user
  // can configure sync, upload local files, or explore the database.
  return <Routing />;
};

export default App;
