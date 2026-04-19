'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, Briefcase, ClipboardList, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/Button';

const navItems = [
  { name: 'Home',    href: '/dashboard',         icon: Home,          activeOn: ['/dashboard'] },
  { name: 'Jobs',    href: '/jobs',              icon: Briefcase,     activeOn: ['/jobs'] },
  { name: 'Applied', href: '/dashboard/history', icon: ClipboardList, activeOn: ['/dashboard/history'] },
  { name: 'Profile', href: '/profile',           icon: UserIcon,      activeOn: ['/profile'] },
];

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-2xl border-t border-white/[0.06]" />

      <div className="relative flex items-stretch justify-around px-2 h-16">
        {navItems.map((item) => {
          const isActive = item.activeOn.some(
            (path) => pathname === path || pathname.startsWith(path + '/')
          );
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 transition-colors duration-200',
                isActive ? 'text-primary-400' : 'text-slate-500 active:text-slate-300'
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 inset-x-3 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'w-10 h-7 flex items-center justify-center rounded-full transition-all duration-200',
                  isActive ? 'bg-primary-500/15' : ''
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className="shrink-0"
                />
              </motion.div>

              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide leading-none transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-60'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
