import React, { Component, ErrorInfo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { LeadsList } from './pages/LeadsList';
import { LeadDetail } from './pages/LeadDetail';
import { AgentConfig } from './pages/AgentConfig';
import { Settings } from './pages/Settings';
import { ProjectsKanban } from './pages/ProjectsKanban';
import { Analytics } from './pages/Analytics';
import { Integrations } from './pages/Integrations';
import { QATest } from './pages/QATest';
import { Login } from './pages/Login';
import { Loader2 } from 'lucide-react';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-white p-4 rounded border border-red-200 overflow-auto">
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CRMProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="kanban" element={<Kanban />} />
                <Route path="projects" element={<ProjectsKanban />} />
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="agent" element={<AgentConfig />} />
                <Route path="settings" element={<Settings />} />
                <Route path="qa-test" element={<QATest />} />
              </Route>
            </Routes>
          </Router>
        </CRMProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
