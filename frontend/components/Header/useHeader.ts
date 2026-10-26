import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemStore } from '../../store/useSystemStore';

export function useHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { statusInfo, isSyncing, phase } = useSystemStore();

  const currentPath = location.pathname;

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return {
    currentPath,
    navigateTo,
    statusInfo,
    isSyncing,
    isDbReady: phase === 'ready',
  };
}
