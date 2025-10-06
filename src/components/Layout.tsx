// File: src/components/Layout.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Clock, 
  History, 
  User, 
  Users, 
  BookOpen, 
  MapPin, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Student navigation items
  const studentNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/timetable', icon: Calendar, label: 'My Timetable' },
    { path: '/attendance', icon: Clock, label: 'Check-In' },
    { path: '/degree-selection', icon: GraduationCap, label: 'Degree Selection' },
    { path: '/history', icon: History, label: 'Attendance History' },
    { path: '/enrollment', icon: User, label: 'Face Enrollment' },
  ];

  // Admin navigation items  
  const adminNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/dashboard', icon: BarChart3, label: 'Analytics' },
    { path: '/students', icon: Users, label: 'Student Management' },
    { path: '/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/degree-selection', icon: GraduationCap, label: 'Degree Programs' },
    { path: '/admin/student-groups', icon: Users, label: 'Student Groups' },
    { path: '/admin/modules', icon: BookOpen, label: 'Modules' },
    { path: '/admin/venues', icon: MapPin, label: 'Venues' },
    { path: '/admin/schedules', icon: Calendar, label: 'Schedules' },
    { path: '/admin/enrollment-approval', icon: User, label: 'Enrollments' },
  ];

  // Lecturer navigation items
  const lecturerNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/timetable', icon: Calendar, label: 'My Schedule' },
    { path: '/attendance', icon: Clock, label: 'Take Attendance' },
    { path: '/history', icon: History, label: 'Attendance Records' },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'student': return studentNavItems;
      case 'admin': return adminNavItems;
      case 'lecturer': return lecturerNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">UniAttend</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActivePath(item.path)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full bg-gray-300 p-2" />
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">{user?.name}</p>
                <p className="text-sm font-medium text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">UniAttend</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActivePath(item.path)
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <User className="h-9 w-9 rounded-full bg-gray-300 p-1" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;