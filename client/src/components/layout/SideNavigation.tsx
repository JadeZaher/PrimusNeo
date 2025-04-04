import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Database, 
  Server, 
  HardDrive, 
  Parentheses, 
  Globe, 
  Terminal, 
  ShieldCheck, 
  Settings, 
  HelpCircle,
  CloudIcon,
  KeyRound,
  Map,
  Box
} from "lucide-react";
import { User } from "@/lib/types";

interface SideNavigationProps {
  user: User;
}

export default function SideNavigation({ user }: SideNavigationProps) {
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
    { name: "Security", icon: <ShieldCheck className="mr-3 h-5 w-5" />, path: "/services/security" },
    { name: "Web3 Identity (Oasis)", icon: <KeyRound className="mr-3 h-5 w-5" />, path: "/services/web3" },
    { name: "Spatial Services", icon: <Map className="mr-3 h-5 w-5" />, path: "/services/spatial" },
    { name: "3D Services (AMP)", icon: <Box className="mr-3 h-5 w-5" />, path: "/services/3d_amp" }
  ];
  
  const secondaryItems = [
    { name: "Settings", icon: <Settings className="mr-3 h-5 w-5" />, path: "/settings" },
    { name: "Help & Support", icon: <HelpCircle className="mr-3 h-5 w-5" />, path: "/support" }
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-300 bg-white">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <CloudIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">CloudHub</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
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
        
        {/* User Profile */}
        <div className="flex items-center px-4 py-3 border-t border-neutral-300">
          <div className="flex-shrink-0">
            <img 
              className="h-8 w-8 rounded-full" 
              src={user.avatar || "https://via.placeholder.com/32"} 
              alt={`${user.fullName} avatar`}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">{user.fullName}</p>
            <p className="text-xs text-neutral-600">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
