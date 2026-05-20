'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { KanbanSquare, LayoutDashboard, FolderKanban, LogOut, User, ShieldAlert } from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        localStorage.removeItem('user');
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/15 group-hover:scale-105 transition-transform duration-200">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
              TaskManager
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-slate-900 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith('/projects')
                  ? 'bg-slate-900 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Projects
            </Link>
          </nav>
        </div>

        {/* Profile and Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              {/* User Avatar Circle */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold font-mono">
                {getInitials(user.name)}
              </div>

              {/* User Details */}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-200">{user.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wide">
                      <ShieldAlert className="w-3 h-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wide">
                      <User className="w-3 h-3" />
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex md:hidden items-center gap-1 mr-1">
              <Link
                href="/"
                className={`p-2 rounded-lg ${
                  pathname === '/' ? 'text-indigo-400 bg-slate-900' : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <Link
                href="/projects"
                className={`p-2 rounded-lg ${
                  pathname.startsWith('/projects') ? 'text-indigo-400 bg-slate-900' : 'text-slate-400'
                }`}
              >
                <FolderKanban className="w-5 h-5" />
              </Link>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
