import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { DatabaseExplorerWeb } from './Views/DatabaseExplorerWeb';
import { DatabaseExplorerMobile } from './Views/DatabaseExplorerMobile';

export const DatabaseExplorer: React.FC = () => {
  const breakpoint = useBreakpoint();
  return React.createElement(breakpoint === 'web' ? DatabaseExplorerWeb : DatabaseExplorerMobile);
};

export default DatabaseExplorer;
