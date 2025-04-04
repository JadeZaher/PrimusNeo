import { Search, Bell, HelpCircle, Settings, Menu } from "lucide-react";

interface TopNavigationProps {
  onOpenMobileMenu: () => void;
}

export default function TopNavigation({ onOpenMobileMenu }: TopNavigationProps) {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-neutral-300">
      <button 
        className="md:hidden px-4 text-neutral-500 focus:outline-none"
        onClick={onOpenMobileMenu}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-500" />
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md text-sm placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Search resources..." 
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <button className="p-1 text-neutral-500 rounded-full hover:bg-neutral-200 focus:outline-none">
            <Bell className="h-6 w-6" />
          </button>
          
          <button className="p-1 text-neutral-500 rounded-full hover:bg-neutral-200 focus:outline-none">
            <HelpCircle className="h-6 w-6" />
          </button>
          
          <button className="p-1 text-neutral-500 rounded-full hover:bg-neutral-200 focus:outline-none">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
