import React, { PropsWithChildren } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Header } from '../components/Header';
import { Overlays } from './Overlays';
import { useSystemStore } from '../store/useSystemStore';
import styles from './Layout.module.scss';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const breakpoint = useBreakpoint();
  const { statusInfo } = useSystemStore();

  if (breakpoint === 'mobile') {
    return (
      <div className={styles.layoutMobile}>
        <Header />
        <main className={styles.main}>{children}</main>
        <Overlays />
      </div>
    );
  }

  return (
    <div className={styles.layoutWeb}>
      <Header />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>In-Browser Server • Powered by SQLite-WASM & Web Workers</span>
        <span>Storage: {statusInfo?.dbType} • {statusInfo?.tableCount ?? 0} Tables</span>
      </footer>
      <Overlays />
    </div>
  );
};
