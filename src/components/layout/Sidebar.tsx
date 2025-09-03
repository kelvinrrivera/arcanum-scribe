import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Sparkles,
  Wand2,
  Library,
  Crown,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  CreditCard,
  Users,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      show: true
    },
    {
      name: 'Generate',
      href: '/generate',
      icon: Wand2,
      show: !!user
    },
    {
      name: 'Library',
      href: '/library',
      icon: Library,
      show: !!user
    },
    {
      name: 'Pricing',
      href: '/pricing',
      icon: Crown,
      show: true
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      show: !!user && (user.role === 'admin' || profile?.subscription_tier === 'admin' || profile?.tier === 'admin')
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-background border-r z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        sidebar-width
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Arcanum Scribe
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems
              .filter(item => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                   <Link
                     key={item.name}
                     to={item.href}
                     className={`
                       relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 group overflow-hidden
                       ${isActive 
                         ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25' 
                         : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                       }
                     `}
                     onClick={() => {
                       // Close sidebar on mobile after navigation
                       if (window.innerWidth < 1024) {
                         onToggle();
                       }
                     }}
                   >
                     {/* Active indicator line */}
                     {isActive && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full"></div>
                     )}
                     
                     {/* Icon with enhanced styling */}
                     <div className={`relative p-1 rounded-md mr-3 transition-all duration-300 ${
                       isActive 
                         ? 'bg-primary-foreground/20' 
                         : 'group-hover:bg-muted'
                     }`}>
                       <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${
                         isActive ? 'scale-110' : 'group-hover:scale-105'
                       }`} />
                     </div>
                     
                     {/* Text with enhanced typography */}
                     <span className={`transition-all duration-300 ${
                       isActive 
                         ? 'font-semibold' 
                         : 'group-hover:translate-x-1'
                     }`}>
                       {item.name}
                     </span>
                     
                     {/* Active glow effect */}
                     {isActive && (
                       <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg pointer-events-none"></div>
                     )}
                     
                     {/* Hover shimmer effect */}
                     {!isActive && (
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"></div>
                     )}
                   </Link>
                 );
              })}
          </nav>

          {/* User Section */}
          {user ? (
            <div className="p-4 border-t">
              <Card className="bg-card/50">
                <CardContent className="p-4 space-y-3">
                  {/* User Info */}
                  <div className="user-info-compact">
                    <Avatar className="user-avatar-compact">
                      <AvatarFallback className="gradient-primary text-primary-foreground">
                        {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="user-text-compact">
                        {profile?.display_name || 'GM'}
                      </p>
                      <p className="user-email-compact">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Plan & Credits - Simplified */}
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary" className="badge-compact">
                      <Crown className="h-3 w-3 mr-1" />
                      {user.subscription_tier || profile?.subscription_tier || 'Free'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {user.credits_remaining || 0} credits
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-tight">
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Link to="/generate">
                        <Wand2 className="h-3 w-3 mr-2" />
                        Generate Adventure
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Link to="/library">
                        <Library className="h-3 w-3 mr-2" />
                        My Library
                      </Link>
                    </Button>
                  </div>

                  {/* Settings & Sign Out */}
                  <div className="pt-2 border-t space-y-tight">
                    <Button 
                      asChild 
                      size="sm" 
                      variant="ghost" 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Link to="/settings">
                        <Settings className="h-3 w-3 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-3 w-3 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-4 border-t space-y-3">
              <Button asChild className="w-full gradient-primary text-primary-foreground">
                <Link to="/auth">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 