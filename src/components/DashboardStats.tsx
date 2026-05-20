'use strict';
'use client';

import React from 'react';
import { FolderKanban, ListTodo, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface Metrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface DashboardStatsProps {
  metrics: Metrics;
}

export default function DashboardStats({ metrics }: DashboardStatsProps) {
  const completionRate = metrics.totalTasks > 0 
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
    : 0;

  const stats = [
    {
      name: 'Total Projects',
      value: metrics.totalProjects,
      description: 'Active team spaces',
      icon: FolderKanban,
      color: 'from-blue-600/10 to-indigo-600/10 border-blue-500/20 text-blue-400',
    },
    {
      name: 'Total Tasks',
      value: metrics.totalTasks,
      description: `In progress: ${metrics.inProgressTasks} | To do: ${metrics.pendingTasks}`,
      icon: ListTodo,
      color: 'from-indigo-600/10 to-violet-600/10 border-indigo-500/20 text-indigo-400',
    },
    {
      name: 'Completed Tasks',
      value: metrics.completedTasks,
      description: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      color: 'from-emerald-600/10 to-teal-600/10 border-emerald-500/20 text-emerald-400',
    },
    {
      name: 'Overdue Tasks',
      value: metrics.overdueTasks,
      description: metrics.overdueTasks > 0 ? 'Requires attention!' : 'All clear',
      icon: AlertTriangle,
      color: metrics.overdueTasks > 0
        ? 'from-rose-600/10 to-orange-600/10 border-rose-500/20 text-rose-400'
        : 'from-slate-800/20 to-slate-900/20 border-slate-800 text-slate-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-tr ${stat.color} border backdrop-blur-xl rounded-2xl p-6 shadow-lg flex items-start justify-between group hover:scale-[1.02] hover:shadow-indigo-500/5 transition-all duration-300`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stat.name}
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
                {stat.value}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {stat.description}
              </p>
            </div>
            <div className={`p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Modern status visual bar */}
      <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Overall Progress</h3>
            <p className="text-xs text-slate-500 mt-1">Percentage of tasks fully completed in workspace</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            {completionRate}% Completed
          </div>
        </div>
        <div className="w-full h-3 bg-slate-950 border border-slate-900 rounded-full overflow-hidden p-[2px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-500 shadow-md shadow-indigo-600/35"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
