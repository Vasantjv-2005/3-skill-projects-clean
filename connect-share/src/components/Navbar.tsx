import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/create', icon: PlusSquare, label: 'Create' },
    { path: `/profile/${profile?.username || ''}`, icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 border-r border-border bg-card flex-col p-4 z-50">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">Snapgram</span>
        </Link>

        {/* Nav Items */}
        <div className="flex-1 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200',
                isActive(path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="gradient-primary text-primary-foreground">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground truncate">@{profile?.username}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="w-6 h-6" />
            <span>Logout</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 z-50">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-colors',
              isActive(path)
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="w-6 h-6" />
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-center px-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">Snapgram</span>
        </Link>
      </header>
    </>
  );
}
