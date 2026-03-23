import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { PencilRuler, Users, UserPlus, ClipboardList, Home } from 'lucide-react';

export function RootLayout() {
  const { pathname } = useLocation();

  // Ocultar nav inferior en pantallas de bienvenida, login o registro, y modales /capture
  const hideBottomNav = pathname.includes('/student/') || 
                        pathname.includes('/capture') || 
                        pathname.includes('/manual-capture') || 
                        pathname.includes('/students') ||
                        pathname === '/welcome' ||
                        pathname === '/' ||
                        pathname === '/login' ||
                        pathname === '/register';

  const isDarkBg = pathname === '/welcome' || pathname === '/';

  return (
    <div className={`min-h-screen h-screen w-full flex items-center justify-center sm:p-0 transition-colors duration-500 ${isDarkBg ? 'bg-slate-900' : 'bg-white sm:bg-gray-50'}`}>
      <div className={`w-full h-full max-w-md sm:shadow-2xl sm:rounded-[2.5rem] sm:h-[800px] sm:max-h-screen relative flex flex-col overflow-hidden sm:ring-1 sm:ring-gray-100 transition-colors duration-500 ${isDarkBg ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Fake Status Bar */}
        <div className={`h-6 w-full flex items-center justify-center pt-2 pb-1 z-20 shrink-0 transition-colors duration-500 ${isDarkBg ? 'bg-slate-900' : 'bg-white'}`}>
          <div className={`w-16 h-1.5 rounded-full ${isDarkBg ? 'bg-white/20' : 'bg-gray-300'}`} />
        </div>

        <main className={`flex-1 min-h-0 w-full relative overflow-y-auto overflow-x-hidden flex flex-col transition-colors duration-500 ${isDarkBg ? 'bg-slate-900' : 'bg-gray-50'}`}>
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        {!hideBottomNav && (
          <nav className="h-[4.5rem] bg-white border-t border-gray-100 flex items-center justify-around px-2 z-20 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <NavLink
              to="/capture"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <PencilRuler className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Capturar</span>
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
            </NavLink>
            <NavLink
              to="/records"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <ClipboardList className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Registros</span>
            </NavLink>
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Grupos</span>
            </NavLink>
          </nav>
        )}

        {/* Fake Home Indicator */}
        <div className={`h-8 w-full flex items-center justify-center z-20 shrink-0 transition-colors duration-500 ${isDarkBg ? 'bg-slate-900' : 'bg-white'}`}>
          <div className={`w-32 h-1.5 rounded-full ${isDarkBg ? 'bg-white/20' : 'bg-gray-900'}`} />
        </div>
      </div>
    </div>
  );
}
