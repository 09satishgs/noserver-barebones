import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { SyncSettings } from '../components/SyncSettings';
import { DatabaseExplorer } from '../components/DatabaseExplorer';
import { useSystemStore } from '../store/useSystemStore';

// Non-generic character views commented out for fork reference:
// import { CharacterList } from '../components/CharacterList';
// import { CharacterDetail } from '../components/CharacterDetail';

const ExploreGuard: React.FC = () => {
  const { phase } = useSystemStore();
  if (phase !== 'ready') {
    return <Navigate to="/" replace />;
  }
  return <DatabaseExplorer />;
};

export const Routing: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Default Route: Database Setup & Sync */}
          <Route path="/" element={<SyncSettings />} />

          {/* Dynamic SQL Database Explorer */}
          <Route path="/explore" element={<ExploreGuard />} />

          {/* Non-generic character routes commented out:
          <Route path="/characters" element={<CharacterList />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};
