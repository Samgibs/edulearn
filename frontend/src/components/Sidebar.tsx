import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['admin', 'teacher'] },
    { name: 'Students', href: '/students', icon: UserGroupIcon, roles: ['admin', 'teacher'] },
    { name: 'Teachers', href: '/teachers', icon: AcademicCapIcon, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon, roles: ['admin'] },
    { name: 'Live Sessions', href: '/live-sessions', icon: VideoCameraIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    user?.is_superuser || item.roles.includes(user?.role || '')
  );

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm border-r border-secondary-200">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-primary-600">EduLearn</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-primary-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
