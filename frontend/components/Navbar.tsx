'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Briefcase, 
  Sparkles,
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import Button, { cn } from './ui/Button';
import { NotificationBell } from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Applications', href: '/dashboard/applications', icon: ClipboardList },
  ];

  const isActive = (path: string) => pathname === path;
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 premium-gradient rounded-lg text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-glow-indigo">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-text leading-none">
                  CareerGuide<span className="text-primary-500">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href) 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                )}
              >
                <item.icon size={16} strokeWidth={2} />
                {item.name}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-border/50 flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <NotificationBell />

                  <Link href="/profile" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-surface border-2 border-border shadow-sm flex items-center justify-center text-primary-400 group-hover:bg-primary/20 transition-smooth relative overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={18} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text transition-colors group-hover:text-primary-300 flex items-center gap-1.5 leading-none">
                        {userName}
                        {user?.is_premium && <span className="text-[8px] text-primary-400 font-black px-1.5 py-0.5 bg-primary/10 rounded-full border border-primary/20">PRO</span>}
                      </span>
                    </div>
                  </Link>

                  <button 
                    onClick={logout}
                    className="w-9 h-9 border border-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl flex items-center justify-center text-text-muted transition-smooth"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-bold text-xs">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="font-bold text-xs shadow-sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile UI */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link href="/profile" className="w-9 h-9 rounded-full bg-surface border-2 border-border flex items-center justify-center text-primary-400 shadow-sm overflow-hidden">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={userName} className="w-full h-full object-cover" />
                ) : (
                    <UserIcon size={18} />
                )}
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-text border border-border"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {user && navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold",
                    isActive(item.href) 
                      ? 'bg-primary/20 text-primary-300' 
                      : 'text-text-secondary hover:bg-surface'
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  <div className="h-px bg-border my-4 mx-4" />
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}
              
              {!user && (
                 <div className="flex flex-col gap-2 p-2">
                   <Link href="/login" onClick={() => setIsOpen(false)}>
                     <Button variant="ghost" className="w-full font-bold">Log In</Button>
                   </Link>
                   <Link href="/signup" onClick={() => setIsOpen(false)}>
                     <Button className="w-full font-bold">Get Started</Button>
                   </Link>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
