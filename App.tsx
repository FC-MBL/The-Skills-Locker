
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
import { Profile } from './pages/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseList } from './pages/admin/CourseList';
import { CourseEditor } from './pages/admin/CourseEditor';
import { UsersCohorts } from './pages/admin/UsersCohorts';
import { Submissions } from './pages/admin/Submissions';

// Contributor Pages
import { BuilderDashboard } from './pages/contributor/BuilderDashboard';
import { BuilderMetadata } from './pages/contributor/BuilderMetadata';
import { BuilderCourseBuilder } from './pages/contributor/BuilderCourseBuilder';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  if (!user) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>; // Wrap learner routes in Learner Layout
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  // In a real app, check for 'ADMIN' | 'EDITOR' role
  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) return <Navigate to="/dashboard" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const ContributorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  if (!user || (user.role !== 'CONTRIBUTOR' && user.role !== 'ADMIN' && user.role !== 'EDITOR')) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
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
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><CourseList /></AdminRoute>} />
        <Route path="/admin/courses/new" element={<AdminRoute><CourseEditor /></AdminRoute>} />
        <Route path="/admin/courses/:id" element={<AdminRoute><CourseEditor /></AdminRoute>} />
        <Route path="/admin/courses/:id/builder" element={<ContributorRoute><BuilderCourseBuilder /></ContributorRoute>} />
        <Route path="/admin/submissions" element={<AdminRoute><Submissions /></AdminRoute>} />
        <Route path="/admin/cohorts" element={<AdminRoute><UsersCohorts /></AdminRoute>} />
        {/* Question Bank placeholder reused for now or could be separate */}
        <Route path="/admin/question-bank" element={<AdminRoute><div className="p-8 font-bold">Question Bank Under Construction</div></AdminRoute>} />

        {/* Contributor Routes */}
        <Route path="/contribute" element={<ContributorRoute><BuilderDashboard /></ContributorRoute>} />
        <Route path="/contribute/:courseId/metadata" element={<ContributorRoute><BuilderMetadata /></ContributorRoute>} />
        <Route path="/contribute/:courseId/structure" element={<ContributorRoute><BuilderCourseBuilder /></ContributorRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
