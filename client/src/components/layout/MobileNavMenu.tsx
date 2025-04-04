import { Link, useLocation } from "wouter";
import { X, CloudIcon, LayoutDashboard, Database, Server, HardDrive, Parentheses, Globe, Terminal, ShieldCheck, Settings, HelpCircle } from "lucide-react";
import { User } from "@/lib/types";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function MobileNavMenu({ isOpen, onClose, user }: MobileNavMenuProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  const navigationItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, path: "/" },
    { name: "Databases", icon: <Database className="mr-3 h-5 w-5" />, path: "/services/database" },
    { name: "Compute", icon: <Server className="mr-3 h-5 w-5" />, path: "/services/compute" },
    { name: "Storage", icon: <HardDrive className="mr-3 h-5 w-5" />, path: "/services/storage" },
    { name: "Functions", icon: <Parentheses className="mr-3 h-5 w-5" />, path: "/services/functions" },
    { name: "Networking", icon: <Globe className="mr-3 h-5 w-5" />, path: "/services/networking" },
    { name: "CI/CD", icon: <Terminal className="mr-3 h-5 w-5" />, path: "/services/cicd" },
    { name: "Security", icon: <ShieldCheck className="mr-3 h-5 w-5" />, path: "/services/security" }
  ];
  
  const secondaryItems = [
    { name: "Settings", icon: <Settings className="mr-3 h-5 w-5" />, path: "/settings" },
    { name: "Help & Support", icon: <HelpCircle className="mr-3 h-5 w-5" />, path: "/support" }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex z-40 md:hidden">
      <div className="fixed inset-0 bg-neutral-600 bg-opacity-75" aria-hidden="true" onClick={onClose} />
      
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button 
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <CloudIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg">CloudHub</span>
            </div>
          </div>
          
          <nav className="mt-5 px-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? "text-white bg-primary"
                    : "text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-neutral-300 mt-6">
              {secondaryItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? "text-white bg-primary"
                      : "text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-neutral-300 p-4">
          <div className="flex items-center">
            <div>
              <img 
                className="h-10 w-10 rounded-full" 
                src={user.avatar || "https://via.placeholder.com/40"} 
                alt={`${user.fullName} avatar`}
              />
            </div>
            <div className="ml-3">
              <p className="text-base font-medium text-neutral-800">{user.fullName}</p>
              <p className="text-sm text-neutral-600">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-14">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );
}
