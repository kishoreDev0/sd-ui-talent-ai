import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
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
  X,
  Sun,
  Moon,
} from 'lucide-react';
import TalentEdgeLogo from '@/components/logo/talentedge-logo';
import { UserRole } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import InviteUserForm from '@/components/invite-user';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';
// duplicate import removed

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
    roles: [
      'admin',
      'ta_executive',
      'ta_manager',
      'hiring_manager',
      'interviewer',
      'hr_ops',
    ],
  },
  {
    path: '/job-management',
    icon: <User className="h-4 w-4" />,
    label: 'Job Management',
    roles: ['ta_executive'],
    children: [
      {
        path: '/jobs',
        icon: <FileText className="h-4 w-4" />,
        label: 'Job',
        roles: ['ta_executive'],
      },
      {
        path: '/job-requirements',
        icon: <FileText className="h-4 w-4" />,
        label: 'Job Requirements',
        roles: ['ta_executive'],
      },
      {
        path: '/organizations',
        icon: <Building2 className="h-4 w-4" />,
        label: 'Organizations',
        roles: ['ta_executive'],
      },
      {
        path: '/skills',
        icon: <Lightbulb className="h-4 w-4" />,
        label: 'Skills',
        roles: ['ta_executive'],
      },
      {
        path: '/major-skills',
        icon: <Zap className="h-4 w-4" />,
        label: 'Major Skills',
        roles: ['ta_executive'],
      },
      {
        path: '/job-categories',
        icon: <Tag className="h-4 w-4" />,
        label: 'Job Categories',
        roles: ['ta_executive'],
      },
    ],
  },
  {
    path: '/candidates',
    icon: <Users className="h-4 w-4" />,
    label: 'Candidates',
    roles: ['ta_executive', 'ta_manager', 'hiring_manager', 'interviewer'],
  },
  {
    path: '/candidate-tracking',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Candidate Tracking',
    roles: ['ta_manager'],
  },
  {
    path: '/interviews',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Interviews',
    roles: ['ta_executive', 'ta_manager', 'hiring_manager', 'interviewer'],
  },
  {
    path: '/analytics',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Analytics',
    roles: ['admin', 'ta_executive', 'ta_manager', 'hiring_manager'],
  },
  {
    path: '/users',
    icon: <UserCog className="h-4 w-4" />,
    label: 'Users',
    roles: ['admin'],
  },
  {
    path: '/admin/access',
    icon: <Shield className="h-4 w-4" />,
    label: 'Access Control',
    roles: ['admin'],
  },
  {
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
    label: 'Settings',
    roles: [
      'admin',
      'ta_executive',
      'ta_manager',
      'hiring_manager',
      'interviewer',
      'hr_ops',
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, onToggle }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDark, setIsDark] = useState<boolean>(false);
  const effectiveRole = role as UserRole | undefined;
  const filteredNavItems = effectiveRole
    ? navItems.filter((item) => item.roles?.includes(effectiveRole))
    : [];

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path],
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
    // Support both new structure (first_name, last_name) and old structure (name, username)
    if (userData?.first_name) {
      return (
        `${userData.first_name} ${userData.last_name || ''}`.trim() ||
        userData.email ||
        'Admin User'
      );
    }
    return (
      userData?.name || userData?.username || userData?.email || 'Admin User'
    );
  };

  const getUserEmail = () => {
    const userData = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!)
      : null;
    return userData?.email || 'admin@example.com';
  };

  const handleLogout = () => {
    try {
      dispatch(logout());
    } finally {
      window.location.href = '/login';
    }
  };

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <div
      className={`flex h-screen flex-col border-r bg-background transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } lg:relative lg:z-auto z-50`}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={isCollapsed ? onToggle : undefined}
        >
          <TalentEdgeLogo
            showText={!isCollapsed}
            iconSize={isCollapsed ? 'sm' : 'md'}
            className={isCollapsed ? 'justify-center' : ''}
          />
        </div>
        {!isCollapsed && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
              title="Collapse sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
          <DropdownMenu
            open={profileDropdownOpen}
            onOpenChange={setProfileDropdownOpen}
          >
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
              {role === 'admin' && (
                <DropdownMenuItem
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setIsInviteOpen(true);
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Send Invite</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setIsLogoutOpen(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu
            open={profileDropdownOpen}
            onOpenChange={setProfileDropdownOpen}
          >
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
              {role === 'admin' && (
                <DropdownMenuItem
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setIsInviteOpen(true);
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Send Invite</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setIsLogoutOpen(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Send Invite Dialog */}
      <InviteUserForm open={isInviteOpen} onOpenChange={setIsInviteOpen} />

      {/* Logout Confirm Dialog */}
      <Dialog
        open={isLogoutOpen}
        onOpenChange={(open) => {
          setIsLogoutOpen(open);
          if (!open) {
            setProfileDropdownOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLogoutOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
