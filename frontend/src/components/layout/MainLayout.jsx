import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useHostel } from '@/context/useHostel';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isSidebarCollapsed } = useHostel();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen font-sans selection:bg-primary/10" style={{ backgroundColor: '#F0F2F5' }}>
      {isAdminPath && <Sidebar />}
      <main className={cn(
        "min-h-screen transition-all duration-200 ease-in-out",
        isAdminPath ? (isSidebarCollapsed ? "ml-[60px]" : "ml-[180px]") : "w-full overflow-x-hidden"
      )}
      style={{ padding: '24px' }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
