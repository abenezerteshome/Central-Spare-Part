// src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from 'react'; // 👈 Import useState
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
  // 1. We create a state variable here to track if the sidebar is open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for sidebar close events dispatched by Sidebar (for clicks on internal links/backdrop)
  useEffect(() => {
    const onClose = () => setSidebarOpen(false);
    window.addEventListener('sidebar:close', onClose as EventListener);
    return () => window.removeEventListener('sidebar:close', onClose as EventListener);
  }, []);

  return (
    <div className="relative flex h-screen min-w-0 max-w-full overflow-hidden bg-gray-100">
      {/* 2. We pass the state down to the Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* This is the overlay that will close the sidebar when clicked on mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        ></div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* 3. We pass the state AND the function to change it down to the Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
