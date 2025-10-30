import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  UserCheck,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface RoleOption {
  role: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const RoleBypass: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();

  const roles: RoleOption[] = [
    {
      role: 'admin',
      title: 'Admin',
      description: 'Full system control and management',
      icon: Shield,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      role: 'ta_executive',
      title: 'TA Executive',
      description: 'Full create/edit • Job Management',
      icon: Shield,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      role: 'ta_manager',
      title: 'TA Manager',
      description: 'Team activity, time-to-fill, metrics',
      icon: Users,
      color: 'text-cyan-600',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      role: 'hiring_manager',
      title: 'Hiring Manager',
      description: 'Review candidates and manage jobs',
      icon: UserCheck,
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
    },
    {
      role: 'interviewer',
      title: 'Interviewer',
      description: 'Conduct interviews and provide feedback',
      icon: MessageSquare,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      role: 'hr_ops',
      title: 'HR Operations',
      description: 'Offers, onboarding, documentation',
      icon: FileText,
      color: 'text-teal-600',
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  // Map role name to role_id
  const getRoleId = (roleName: string): number => {
    switch (roleName) {
      case 'admin':
        return 1;
      case 'ta_executive':
        return 2;
      case 'ta_manager':
        return 3;
      case 'hiring_manager':
        return 4;
      case 'interviewer':
        return 5;
      case 'hr_ops':
        return 6;
      default:
        return 1;
    }
  };

  const handleRoleSelect = (role: string) => {
    // Get role_id for the selected role
    const roleId = getRoleId(role);

    // Store role in localStorage for bypass with role.id
    const mockUser = {
      id: 1,
      first_name: role.charAt(0).toUpperCase() + role.slice(1),
      last_name: 'User',
      email: `${role}@example.com`,
      role_id: roleId,
      is_active: true,
      role: {
        id: roleId,
        name: role,
      },
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('role', role);

    // Dispatch a custom action to update Redux state
    // For now, just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">
          🚀 Quick Access (Bypass Login)
        </h3>
        <p className="text-center text-xs text-gray-500">
          Click a role to access dashboard directly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.role}
              onClick={() => handleRoleSelect(option.role)}
              className={`
                group relative overflow-hidden rounded-xl p-4
                bg-gradient-to-br ${option.gradient}
                shadow-md hover:shadow-xl
                transform hover:-translate-y-1
                transition-all duration-200
                text-white text-left
              `}
            >
              <div className="relative z-10">
                <IconComponent className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-sm mb-1">{option.title}</h4>
                <p className="text-xs opacity-90 leading-tight">
                  {option.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleBypass;
