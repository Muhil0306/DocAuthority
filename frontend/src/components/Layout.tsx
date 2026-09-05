import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Files, 
  History, 
  CheckCircle, 
  ShieldAlert,
  BarChart,
  AlertTriangle,
  RotateCcw,
  List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { role, setRole, userName } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Knowledge Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Documents', path: '/documents', icon: <Files size={20} /> },
    { name: 'Approvals', path: '/approvals', icon: <CheckCircle size={20} /> },
    { name: 'Evaluation', path: '/evaluation', icon: <BarChart size={20} /> },
    { name: 'Failure Tests', path: '/tests', icon: <AlertTriangle size={20} /> },
    { name: 'Rollback', path: '/rollback', icon: <RotateCcw size={20} /> },
    { name: 'Audit Logs', path: '/audit', icon: <List size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <ShieldAlert className="text-blue-500 mr-3" size={24} />
          <h1 className="text-lg font-bold text-white tracking-wide">DocAuthority</h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs uppercase text-slate-500 font-semibold mb-4 tracking-wider px-2">Navigation</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-500 mb-1">Signed in as</div>
          <div className="font-medium text-sm text-slate-300 truncate">{userName}</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center text-slate-500">
            {/* Breadcrumb could go here */}
            <span className="font-medium">Enterprise Knowledge Base</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500 font-medium">Demo Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 shadow-sm outline-none transition-colors"
              >
                <option value="Consultant">Consultant</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-200">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
