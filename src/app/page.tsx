'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import { 
  Loader2, 
  Calendar, 
  ChevronRight, 
  User, 
  ArrowRight,
  ClipboardList,
  Sparkles
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  };
}

interface Metrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface DashboardData {
  metrics: Metrics;
  recentTasks: Task[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: 'ADMIN' | 'MEMBER' } | null>(null);

  useEffect(() => {
    // Read user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    } else {
      router.push('/login');
      return;
    }

    // Fetch dashboard stats
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Done
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400">
            To Do
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse text-slate-400">Loading your workspace...</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Background gradients */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />

        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/60 to-slate-950 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-400 pointer-events-none">
            <Sparkles className="w-40 h-40" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-200">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {currentDate}
            </p>
          </div>
          <div>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-indigo-600/15"
            >
              Manage Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard Statistics */}
        {data && <DashboardStats metrics={data.metrics} />}

        {/* Recent Tasks Section */}
        <div className="bg-slate-900/40 border border-slate-800/85 backdrop-blur-xl rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-200">
                {user?.role === 'ADMIN' ? 'Recently Created Tasks' : 'My Assigned Tasks'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of recent task activities and requirements
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline underline-offset-4"
            >
              View project boards
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data && data.recentTasks.length > 0 ? (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Task Info</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {data.recentTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-900/25 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-200 text-sm max-w-[200px] sm:max-w-xs truncate">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-400">
                          {task.project.name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{task.assignee.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-400 font-mono">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm">
                          <Link
                            href={`/projects/${task.project.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Open Board
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-slate-950/20 border border-dashed border-slate-800">
              <ClipboardList className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No active tasks found</h3>
              <p className="text-xs text-slate-500 text-center max-w-[280px] mt-1">
                {user?.role === 'ADMIN'
                  ? 'Get started by creating a project and assigning tasks.'
                  : 'Great! You have no tasks assigned to you right now.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
