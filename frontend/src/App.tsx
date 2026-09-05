import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

// Placeholder Pages
import Dashboard from './pages/Dashboard';
import KnowledgeSearch from './pages/KnowledgeSearch';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Approvals from './pages/Approvals';
import Evaluation from './pages/Evaluation';
import FailureTests from './pages/FailureTests';
import Rollback from './pages/Rollback';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<KnowledgeSearch />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="tests" element={<FailureTests />} />
            <Route path="rollback" element={<Rollback />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
