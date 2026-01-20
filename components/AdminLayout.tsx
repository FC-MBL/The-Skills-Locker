import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, BookOpen, Users, FolderPlus, LogOut, Settings } from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800';

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
           <span className="font-display text-xl uppercase tracking-tighter text-secondary">Skills Locker Admin</span>
        </div>
        
        <nav className="flex-grow py-6 space-y-2 px-3">
           <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={20} /> Dashboard
           </Link>
           <Link to="/admin/courses" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/courses')}`}>
              <BookOpen size={20} /> Courses
           </Link>
           <Link to="/admin/cohorts" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/cohorts')}`}>
              <Users size={20} /> Cohorts & Users
           </Link>
           <Link to="/admin/question-bank" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/question-bank')}`}>
              <FolderPlus size={20} /> Question Bank
           </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                    {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-2">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto">
         {children}
      </main>
    </div>
  );
};