import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Lock, Menu, X, User as UserIcon, LayoutDashboard } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-secondary' : 'text-white hover:text-secondary';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isContributor = user?.role === 'CONTRIBUTOR';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-dark text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logos/FC Logo white.png" alt="FIT College" className="h-12" />
              <span className="font-sans text-xl font-bold tracking-wide">Skills Locker</span>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center space-x-8 font-bold uppercase tracking-wide text-sm">
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                <Link to="/catalogue" className={isActive('/catalogue')}>Courses</Link>
                <Link to="/skill-tree" className={isActive('/skill-tree')}>Skill Tree</Link>
                <Link to="/my-learning" className={isActive('/my-learning')}>My Learning</Link>
                <Link to="/profile" className={isActive('/profile')}>Profile</Link>

                {isContributor && (
                  <Link to="/contribute" className={isActive('/contribute')}>Contribute</Link>
                )}

                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 bg-slate-900 text-primary px-3 py-1 rounded hover:bg-slate-800">
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                )}

                <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <UserIcon size={16} />
                    </div>
                    <span className="normal-case">{user.name}</span>
                  </div>
                  <button onClick={logout} className="text-xs underline opacity-80 hover:opacity-100">Sign Out</button>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/auth" className="bg-primary text-white px-6 py-2 rounded-full font-bold uppercase text-sm hover:bg-red-700 transition-colors">
                  Login / Sign Up
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && user && (
          <div className="md:hidden bg-blue-700 px-4 pt-2 pb-4 space-y-2 border-t border-blue-600">
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">Dashboard</Link>
            <Link to="/catalogue" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">Courses</Link>
            <Link to="/skill-tree" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">Skill Tree</Link>
            <Link to="/my-learning" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">My Learning</Link>
            {isContributor && (
              <Link to="/contribute" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">Contribute</Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-slate-900 text-secondary">Admin Console</Link>
            )}
            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600">Sign Out</button>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold uppercase tracking-widest text-xs mb-2">The Skills Locker</p>
          <p className="text-xs">&copy; 2023. Powered by FIT College.</p>
        </div>
      </footer>
    </div>
  );
};
