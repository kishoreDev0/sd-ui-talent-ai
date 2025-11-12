import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Users, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface Avatar {
  src?: string;
  name?: string;
  alt?: string;
}

export interface CardBaseProps {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

// Event Card Props
export interface EventCardProps extends CardBaseProps {
  title: string;
  time: string;
  description?: string;
  category?: string;
  icon?: LucideIcon;
  iconColor?: string;
  participants?: Avatar[];
  variant?: 'default' | 'large';
}

// Task Card Props
export interface TaskCardProps extends CardBaseProps {
  number?: string | number;
  label: string;
  avatar?: Avatar;
  status?: 'pending' | 'completed' | 'in-progress';
}

// Activity Card Props
export interface ActivityCardProps extends CardBaseProps {
  activity: string;
  duration: string;
  icon?: LucideIcon;
  iconColor?: string;
}

// Meeting Card Props
export interface MeetingCardProps extends CardBaseProps {
  title: string;
  time: string;
  participants?: Avatar[];
  status?: 'upcoming' | 'active' | 'completed';
  showJoinButton?: boolean;
  onJoin?: () => void;
}

// People List Card Props
export interface PeopleListCardProps extends CardBaseProps {
  people: Array<{
    avatar?: Avatar;
    name: string;
    notificationCount?: number;
  }>;
}

// Status Card Props
export interface StatusCardProps extends CardBaseProps {
  title: string;
  date?: string;
  status: 'done' | 'pending' | 'active';
  icon?: LucideIcon;
}

// Navigation Card Props
export interface NavigationCardProps extends CardBaseProps {
  title: string;
  time?: string;
  nextLabel?: string;
  showArrow?: boolean;
}

// Date Selector Card Props
export interface DateSelectorCardProps extends CardBaseProps {
  title: string;
  dates: Array<{ day: number; selected?: boolean; hasDot?: boolean }>;
  nextLabel?: string;
}

// Event Card Component
export const EventCard: React.FC<EventCardProps> = ({
  title,
  time,
  description,
  category,
  icon: Icon,
  iconColor = 'text-purple-600',
  participants = [],
  variant = 'default',
  className = '',
  onClick,
}) => {
  const isLarge = variant === 'large';

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3
            className={`font-bold text-gray-900 ${isLarge ? 'text-xl' : 'text-base'}`}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{time}</p>
        </div>
        {Icon && (
          <div className={`${iconColor} ${isLarge ? 'w-8 h-8' : 'w-6 h-6'}`}>
            <Icon className="w-full h-full" />
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-600 mt-2 mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {(category || participants.length > 0) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {category && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-4 h-4" />
              <span>{category}</span>
            </div>
          )}
          {participants.length > 0 && (
            <div className="flex items-center -space-x-2">
              {participants.slice(0, 3).map((participant, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                  title={participant.name || participant.alt}
                >
                  {participant.src ? (
                    <img
                      src={participant.src}
                      alt={participant.alt || participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (participant.name || 'U')[0].toUpperCase()
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Task Card Component
export const TaskCard: React.FC<TaskCardProps> = ({
  number,
  label,
  avatar,
  status = 'pending',
  className = '',
  onClick,
}) => {
  const statusStyles: Record<
    NonNullable<TaskCardProps['status']>,
    { badge: string; label: string }
  > = {
    pending: {
      badge: 'bg-amber-100 text-amber-700',
      label: 'Pending',
    },
    'in-progress': {
      badge: 'bg-blue-100 text-blue-700',
      label: 'In Progress',
    },
    completed: {
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'Completed',
    },
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start">
        <div>
          {number && (
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{number}</h3>
          )}
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 border-2 border-white flex items-center justify-center">
            {avatar.src ? (
              <img
                src={avatar.src}
                alt={avatar.alt || avatar.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-semibold">
                {(avatar.name || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-3">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[status].badge}`}
        >
          {statusStyles[status].label}
        </span>
      </div>
    </motion.div>
  );
};

// Activity Card Component
export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  duration,
  icon: Icon,
  iconColor = 'text-yellow-600',
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">{duration}</p>
          <h3 className="font-semibold text-gray-900">{activity}</h3>
        </div>
        {Icon && (
          <div className={`${iconColor} w-8 h-8`}>
            <Icon className="w-full h-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Meeting Card Component
export const MeetingCard: React.FC<MeetingCardProps> = ({
  title,
  time,
  participants = [],
  status = 'upcoming',
  showJoinButton = false,
  onJoin,
  className = '',
  onClick,
}) => {
  const isActive = status === 'active';

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{time}</p>
        </div>
      </div>

      {isActive && participants.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center -space-x-3">
            {participants.map((participant, idx) => (
              <div
                key={idx}
                className={`w-12 h-12 rounded-full border-2 border-white flex items-center justify-center ${
                  idx === 0 ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {participant.src ? (
                  <img
                    src={participant.src}
                    alt={participant.alt || participant.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {(participant.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
          {participants.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {participants[0].name} Started 5m ago
            </p>
          )}
        </div>
      )}

      {showJoinButton && isActive && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 mt-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

// People List Card Component
export const PeopleListCard: React.FC<PeopleListCardProps> = ({
  people,
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {people.map((person, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {person.avatar?.src ? (
                <img
                  src={person.avatar.src}
                  alt={person.avatar.alt || person.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {person.name[0].toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {person.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {person.notificationCount !== undefined &&
              person.notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {person.notificationCount}
                </span>
              )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Status Card Component
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  date,
  status,
  icon: Icon,
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {date && <p className="text-xs text-gray-500 mb-1">{date}</p>}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {status === 'done' && (
          <CheckCircle2 className="w-5 h-5 text-gray-900" />
        )}
        {Icon && status !== 'done' && (
          <div className="text-green-600 w-6 h-6">
            <Icon className="w-full h-full" />
          </div>
        )}
      </div>
      {status === 'done' && (
        <span className="inline-block mt-2 text-xs text-gray-600">Done</span>
      )}
    </motion.div>
  );
};

// Navigation Card Component
export const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  time,
  nextLabel = 'Next Task',
  showArrow = true,
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {time && <p className="text-sm text-gray-600 mb-3">{time}</p>}
      <div className="flex items-center justify-end gap-1 text-xs text-blue-600 font-medium">
        <span>{nextLabel}</span>
        {showArrow && <ChevronRight className="w-4 h-4" />}
      </div>
    </motion.div>
  );
};

// Date Selector Card Component
export const DateSelectorCard: React.FC<DateSelectorCardProps> = ({
  title,
  dates,
  nextLabel = 'Next Task >>',
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
          <span>{nextLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {dates.map((date, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            {date.hasDot && (
              <div
                className={`w-1 h-1 rounded-full ${
                  date.selected ? 'bg-gray-900' : 'bg-gray-400'
                }`}
              />
            )}
            <motion.div
              className={`w-10 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                date.selected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {date.day}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
