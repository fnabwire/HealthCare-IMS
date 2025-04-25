import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { UserIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-primary text-white z-30 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out md:hidden`}
      >
        <SidebarContent currentPath={location} closeSidebar={closeSidebar} userName={user?.name} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:block shadow-lg">
        <SidebarContent currentPath={location} closeSidebar={closeSidebar} userName={user?.name} />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  currentPath: string;
  closeSidebar: () => void;
  userName?: string;
}

function SidebarContent({ currentPath, closeSidebar, userName }: SidebarContentProps) {
  const isActive = (path: string) => {
    return currentPath === path;
  };

  const handleLinkClick = () => {
    closeSidebar();
  };

  return (
    <>
      <div className="p-4 border-b border-primary-light">
        <h1 className="text-xl font-bold flex items-center">
          <span className="material-icons mr-2">local_hospital</span>
          HealthCare IMS
        </h1>
      </div>
      <nav className="mt-4">
        <Link href="/">
          <a 
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 ${
              isActive('/') ? 'bg-primary-light' : 'hover:bg-primary-light transition-colors duration-150'
            }`}
          >
            <span className="material-icons mr-3">dashboard</span>
            Dashboard
          </a>
        </Link>
        
        <Link href="/clients">
          <a 
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 ${
              isActive('/clients') ? 'bg-primary-light' : 'hover:bg-primary-light transition-colors duration-150'
            }`}
          >
            <span className="material-icons mr-3">people</span>
            Clients
          </a>
        </Link>
        
        <Link href="/programs">
          <a 
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 ${
              isActive('/programs') ? 'bg-primary-light' : 'hover:bg-primary-light transition-colors duration-150'
            }`}
          >
            <span className="material-icons mr-3">healing</span>
            Health Programs
          </a>
        </Link>
        
        <Link href="/enrollments">
          <a 
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 ${
              isActive('/enrollments') ? 'bg-primary-light' : 'hover:bg-primary-light transition-colors duration-150'
            }`}
          >
            <span className="material-icons mr-3">assignment_ind</span>
            Enrollments
          </a>
        </Link>
        
        <Link href="/api-docs">
          <a 
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 ${
              isActive('/api-docs') ? 'bg-primary-light' : 'hover:bg-primary-light transition-colors duration-150'
            }`}
          >
            <span className="material-icons mr-3">api</span>
            API Documentation
          </a>
        </Link>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-primary-light">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{userName || 'User'}</p>
            <p className="text-xs text-primary-light">Healthcare Professional</p>
          </div>
        </div>
      </div>
    </>
  );
}
