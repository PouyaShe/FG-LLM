import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { href: '/dashboard/admin', label: 'Admin Dashboard' },
          { href: '/dashboard/admin/users', label: 'Users' },
          { href: '/dashboard/admin/rooms', label: 'Rooms' },
          { href: '/dashboard/admin/recordings', label: 'Recordings' },
          { href: '/dashboard/admin/logs', label: 'Logs' },
        ];
      case 'TEACHER':
        return [
          { href: '/dashboard/teacher', label: 'Teacher Dashboard' },
          { href: '/dashboard/teacher/rooms', label: 'My Rooms' },
          { href: '/dashboard/teacher/schedule', label: 'Schedule' },
          { href: '/dashboard/teacher/files', label: 'Files' },
        ];
      case 'STUDENT':
        return [
          { href: '/dashboard/student', label: 'Student Dashboard' },
          { href: '/dashboard/student/classes', label: 'My Classes' },
          { href: '/dashboard/student/files', label: 'Files' },
          { href: '/dashboard/student/recordings', label: 'Recordings' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                Online Class
              </Link>
              <div className="hidden md:flex ml-10 space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
