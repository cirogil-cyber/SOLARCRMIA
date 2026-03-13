import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, SquareKanban, Settings, Bot, Users, HardHat, PieChart, Plug, ShieldAlert, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: SquareKanban, label: 'CRM Kanban' },
  { to: '/leads', icon: Users, label: 'Leads & Atendimento' },
  { to: '/projects', icon: HardHat, label: 'Projetos (Instalação)' },
  { to: '/analytics', icon: PieChart, label: 'Relatórios' },
  { to: '/integrations', icon: Plug, label: 'Integrações' },
  { to: '/agent', icon: Bot, label: 'Agente IA' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
  { to: '/qa-test', icon: ShieldAlert, label: 'QA Test' },
];

export const Layout: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-semibold text-lg tracking-tight">SolarCRM IA</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-200 flex flex-col gap-2">
          <div className="text-xs text-neutral-500 truncate" title={user?.email}>
            {user?.email}
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
