import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { useStore } from './store';

// Pages
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Catalogue } from './pages/Catalogue';
import { SkillTree } from './pages/SkillTree';
import { ItemDetail } from './pages/ItemDetail';
import { MyLearning } from './pages/MyLearning';
import { Player } from './pages/Player';
import { Assessment } from './pages/Assessment';
import { Credential } from './pages/Credential';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseList } from './pages/admin/CourseList';
import { CourseEditor } from './pages/admin/CourseEditor';
import { CourseBuilder } from './pages/admin/CourseBuilder';
import { UsersCohorts } from './pages/admin/UsersCohorts';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  if (!user) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>; // Wrap learner routes in Learner Layout
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  // In a real app, check for 'ADMIN' | 'EDITOR' role
  if (!user || user.role === 'LEARNER') return <Navigate to="/dashboard" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const App: React.FC = () => {
  return (
    <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Learner Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/catalogue" element={<ProtectedRoute><Catalogue /></ProtectedRoute>} />
          <Route path="/skill-tree" element={<ProtectedRoute><SkillTree /></ProtectedRoute>} />
          <Route path="/items/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
          <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><Player /></ProtectedRoute>} />
          <Route path="/assessment/:id" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/credential/:id" element={<ProtectedRoute><Credential /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><CourseList /></AdminRoute>} />
          <Route path="/admin/courses/new" element={<AdminRoute><CourseEditor /></AdminRoute>} />
          <Route path="/admin/courses/:id" element={<AdminRoute><CourseEditor /></AdminRoute>} />
          <Route path="/admin/courses/:id/builder" element={<AdminRoute><CourseBuilder /></AdminRoute>} />
          <Route path="/admin/cohorts" element={<AdminRoute><UsersCohorts /></AdminRoute>} />
          {/* Question Bank placeholder reused for now or could be separate */}
          <Route path="/admin/question-bank" element={<AdminRoute><div className="p-8 font-bold">Question Bank Under Construction</div></AdminRoute>} />
        </Routes>
    </Router>
  );
};

export default App;