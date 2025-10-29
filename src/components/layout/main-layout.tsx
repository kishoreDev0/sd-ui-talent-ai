import React, { useState } from 'react';
import Sidebar from './sidebar';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, role }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          role={role} 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
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
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMobileSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Talent AI</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
        
        <div className="p-2">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
