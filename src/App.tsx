import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import CourseList from './pages/admin/courses/CourseList';
import CourseForm from './pages/admin/courses/CourseForm';
import CourseBuilder from './pages/admin/courses/CourseBuilder';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR', 'REVIEWER']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/courses"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR', 'REVIEWER']}>
                                <CourseList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                                <CourseForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:id"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                                <CourseForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/courses/:id/builder"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
                                <CourseBuilder />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
