import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { SyncSettingsWeb } from './Views/SyncSettingsWeb';
import { SyncSettingsMobile } from './Views/SyncSettingsMobile';

export const SyncSettings: React.FC = () => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? SyncSettingsWeb : SyncSettingsMobile);
};

export default SyncSettings;
