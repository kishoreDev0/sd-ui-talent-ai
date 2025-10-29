import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Settings,
  UserCog,
  TrendingUp,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Building2,
  Lightbulb,
  Zap,
  Tag,
  FileText,
  ChevronUp,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { UserRole } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  role: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: 'Dashboard',
    roles: ['admin', 'hiring_manager', 'interviewer', 'ta_team', 'hr_ops'],
  },
  {
    path: '/job-management',
    icon: <User className="h-4 w-4" />,
    label: 'Job Management',
    roles: ['admin'],
    children: [
      {
        path: '/jobs',
        icon: <FileText className="h-4 w-4" />,
        label: 'Job',
        roles: ['admin'],
      },
      {
        path: '/job-requirements',
        icon: <FileText className="h-4 w-4" />,
        label: 'Job Requirements',
        roles: ['admin'],
      },
      {
        path: '/organizations',
        icon: <Building2 className="h-4 w-4" />,
        label: 'Organizations',
        roles: ['admin'],
      },
      {
        path: '/skills',
        icon: <Lightbulb className="h-4 w-4" />,
        label: 'Skills',
        roles: ['admin'],
      },
      {
        path: '/major-skills',
        icon: <Zap className="h-4 w-4" />,
        label: 'Major Skills',
        roles: ['admin'],
      },
      {
        path: '/job-categories',
        icon: <Tag className="h-4 w-4" />,
        label: 'Job Categories',
        roles: ['admin'],
      },
    ],
  },
  {
    path: '/candidates',
    icon: <Users className="h-4 w-4" />,
    label: 'Candidates',
    roles: ['admin', 'hiring_manager', 'interviewer', 'ta_team'],
  },
  {
    path: '/resume-validation',
    icon: <Sparkles className="h-4 w-4" />,
    label: 'Resume Validation',
    roles: ['ta_team'],
  },
  {
    path: '/interviews',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Interviews',
    roles: ['admin', 'hiring_manager', 'interviewer', 'ta_team'],
  },
  {
    path: '/analytics',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Analytics',
    roles: ['admin', 'hiring_manager'],
  },
  {
    path: '/users',
    icon: <UserCog className="h-4 w-4" />,
    label: 'Users',
    roles: ['admin'],
  },
  {
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
    label: 'Settings',
    roles: ['admin'],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, onToggle }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path}>
        {hasChildren ? (
          // Parent item with children (like Job Management)
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => {
              if (!isCollapsed) {
                toggleExpanded(item.path);
              }
            }}
          >
            {item.icon}
            {!isCollapsed && <span className="flex-1">{item.label}</span>}
            {!isCollapsed && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        ) : (
          // Regular navigation item (like Dashboard, Candidates, etc.)
          <Link
            to={item.path}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {item.icon}
            {!isCollapsed && <span className="flex-1">{item.label}</span>}
          </Link>
        )}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => {
              const isChildActive = location.pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isChildActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {child.icon}
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getUserDisplayName = () => {
    const userData = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null;
    return userData?.name || userData?.username || 'Admin User';
  };

  const getUserEmail = () => {
    const userData = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null;
    return userData?.email || 'admin@example.com';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className={`flex h-screen flex-col border-r bg-background transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } lg:relative lg:z-auto z-50`}>
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={isCollapsed ? onToggle : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && <span className="font-semibold">Talent AI</span>}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>


      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer with Profile Dropdown */}
      <div className="border-t p-4">
        {isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center px-2 py-2 h-auto"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 py-2 h-auto"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-1 flex-col items-start text-left text-sm">
                  <span className="font-medium">{getUserDisplayName()}</span>
                  <span className="text-xs text-muted-foreground">
                    {getUserEmail()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
