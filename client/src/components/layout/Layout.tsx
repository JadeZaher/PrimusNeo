import { useState } from "react";
import SideNavigation from "./SideNavigation";
import TopNavigation from "./TopNavigation";
import MobileNavMenu from "./MobileNavMenu";
import { User } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Using mock user data for the demo
  const mockUser: User = {
    id: 1,
    username: "sarah",
    fullName: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    role: "Developer"
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 text-neutral-800">
      <SideNavigation user={mockUser} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavigation 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none scrollbar-hide">
          {children}
        </main>
      </div>
      
      <MobileNavMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        user={mockUser}
      />
    </div>
  );
}
