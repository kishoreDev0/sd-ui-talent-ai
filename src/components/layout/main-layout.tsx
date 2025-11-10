import React, { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import TalentEdgeLogo from '@/components/logo/talentedge-logo';
import DarkVeil from '@/components/DarkVeil';

interface MainLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, role }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    checkDarkMode();
    return () => observer.disconnect();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Always show sidebar for all roles and routes
  const showSidebar = true;

  return (
    <div className="relative flex h-screen bg-[#f8f7f3] dark:bg-slate-900">
      {/* Desktop Sidebar */}
      {showSidebar && (
        <div className="relative z-20 hidden lg:block">
          <Sidebar
            role={role}
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative h-full">
            <Sidebar
              role={role}
              isCollapsed={false}
              onToggle={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto bg-transparent">
        {isDarkMode && (
          <div
            className="pointer-events-none fixed inset-y-0 right-0 left-[72px] z-0 lg:left-[
                ${isSidebarCollapsed ? '88px' : '280px'}
              ]"
          >
            <DarkVeil />
          </div>
        )}
        {/* Mobile Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-gray-200/60 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-800/80 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMobileSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <TalentEdgeLogo showText={true} iconSize="sm" />
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        <div className="relative z-10 p-4 lg:p-6 xl:p-7">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
