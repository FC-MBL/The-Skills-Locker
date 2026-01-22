import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import { Dashboard } from './screens/Dashboard';
import { CourseMetadata } from './screens/CourseMetadata';
import { CourseBuilder } from './screens/CourseBuilder';
import { AdminSubmissions } from './screens/AdminSubmissions';
import { Profile } from './screens/Profile';
import { Box, User, LogOut, UserCircle } from 'lucide-react';

const SidebarNav = () => {
    const location = useLocation();
    
    // Don't show sidebar in builder mode
    if (location.pathname.includes('/structure')) return null;

    return (
        <nav className="bg-navy text-white h-16 md:h-auto md:w-20 lg:w-64 fixed bottom-0 md:top-0 left-0 w-full z-50 flex md:flex-col justify-between p-4 md:py-8 border-t md:border-t-0 md:border-r border-gray-800">
            <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-8 w-full">
                {/* Logo */}
                <div className="hidden md:flex items-center gap-3 px-2 mb-4">
                    <div className="w-8 h-8 bg-red rounded-lg flex items-center justify-center font-display text-lg">S</div>
                    <span className="font-display text-2xl tracking-wide hidden lg:block">Skills Locker</span>
                </div>

                {/* Links */}
                <div className="flex md:flex-col justify-around md:justify-start w-full gap-2">
                    <Link to="/profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${location.pathname === '/profile' ? 'bg-red text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <UserCircle size={20} />
                        <span className="font-bold uppercase text-sm tracking-wide hidden lg:block">My Profile</span>
                    </Link>
                    <Link to="/" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${location.pathname === '/' || location.pathname === '/dashboard' ? 'bg-red text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Box size={20} />
                        <span className="font-bold uppercase text-sm tracking-wide hidden lg:block">My Courses</span>
                    </Link>
                    <Link to="/admin" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${location.pathname === '/admin' ? 'bg-red text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <User size={20} />
                        <span className="font-bold uppercase text-sm tracking-wide hidden lg:block">Admin</span>
                    </Link>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 text-gray-500 hover:text-white cursor-pointer transition-colors">
                <LogOut size={20} />
                <span className="font-bold uppercase text-sm tracking-wide hidden lg:block">Sign Out</span>
            </div>
        </nav>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isBuilder = location.pathname.includes('/structure');
    
    return (
        <div className={`min-h-screen bg-gray-100 ${!isBuilder ? 'pb-20 md:pb-0 md:pl-20 lg:pl-64' : ''}`}>
            <SidebarNav />
            <main className="h-full">
                {children}
            </main>
        </div>
    );
};

function App() {
  return (
    <CourseProvider>
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminSubmissions />} />
                    <Route path="/editor/:courseId/metadata" element={<CourseMetadata />} />
                    <Route path="/editor/:courseId/structure" element={<CourseBuilder />} />
                </Routes>
            </Layout>
        </HashRouter>
    </CourseProvider>
  );
}

export default App;