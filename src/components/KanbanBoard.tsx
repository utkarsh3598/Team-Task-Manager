'use strict';
'use client';

import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  ArrowRightLeft,
  CheckCircle2, 
  PlayCircle, 
  RotateCcw,
  User,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  };
}

interface KanbanBoardProps {
  tasks: Task[];
  currentUser: {
    id: string;
    role: 'ADMIN' | 'MEMBER';
  } | null;
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
}

export default function KanbanBoard({ tasks, currentUser, onStatusChange }: KanbanBoardProps) {
  const columns: { title: string; status: Task['status']; color: string; bg: string; border: string }[] = [
    { 
      title: 'To Do', 
      status: 'TODO', 
      color: 'text-slate-400',
      bg: 'bg-slate-900/30',
      border: 'border-slate-800/80'
    },
    { 
      title: 'In Progress', 
      status: 'IN_PROGRESS', 
      color: 'text-amber-400',
      bg: 'bg-amber-500/[0.02]',
      border: 'border-amber-500/10'
    },
    { 
      title: 'Done', 
      status: 'DONE', 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/[0.02]',
      border: 'border-emerald-500/10'
    },
  ];

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDateStr: string, status: Task['status']) => {
    if (status === 'DONE') return false;
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    // Strip hours for pure date comparison
    now.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const colTasks = getTasksByStatus(col.status);
        return (
          <div
            key={col.status}
            className={`rounded-2xl border ${col.border} ${col.bg} p-5 flex flex-col min-h-[500px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
              <span className={`font-bold tracking-tight text-sm ${col.color} flex items-center gap-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  col.status === 'TODO' ? 'bg-slate-400' : col.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                {col.title}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 font-mono">
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] scrollbar-thin">
              {colTasks.length > 0 ? (
                colTasks.map((task) => {
                  const taskOverdue = isOverdue(task.dueDate, task.status);
                  // Check if user is allowed to update status (Admin or the assigned Member)
                  const canUpdate = currentUser?.role === 'ADMIN' || currentUser?.id === task.assignee.id;

                  return (
                    <div
                      key={task.id}
                      className={`group bg-slate-950/40 border ${
                        taskOverdue 
                          ? 'border-rose-500/20 hover:border-rose-500/40 shadow-rose-950/5' 
                          : 'border-slate-800 hover:border-slate-700/80 hover:shadow-indigo-500/5'
                      } rounded-xl p-4 shadow-sm transition-all duration-200`}
                    >
                      <div className="space-y-3">
                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors leading-relaxed">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Due Date & Overdue Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                            taskOverdue ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {taskOverdue ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="font-mono">{formatDate(task.dueDate)}</span>
                            {taskOverdue && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 uppercase tracking-wider">
                                Overdue
                              </span>
                            )}
                          </div>

                          {/* Assignee Badge */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300">
                            <div className="w-4 h-4 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[8px] font-bold">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[80px]">{task.assignee.name}</span>
                          </div>
                        </div>

                        {/* Quick Action Panel for Status Updates */}
                        {canUpdate && (
                          <div className="flex items-center gap-1.5 border-t border-slate-800/60 pt-3 mt-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <ArrowRightLeft className="w-3 h-3" />
                              Move:
                            </span>

                            <div className="flex items-center gap-1 ml-auto">
                              {task.status !== 'TODO' && (
                                <button
                                  onClick={() => onStatusChange(task.id, 'TODO')}
                                  className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer transition-all"
                                  title="Move to To Do"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {task.status !== 'IN_PROGRESS' && (
                                <button
                                  onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                                  className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/20 cursor-pointer transition-all"
                                  title="Move to In Progress"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {task.status !== 'DONE' && (
                                <button
                                  onClick={() => onStatusChange(task.id, 'DONE')}
                                  className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 cursor-pointer transition-all"
                                  title="Complete Task"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/10">
                  <ClipboardList className="w-8 h-8 text-slate-700 mb-2" />
                  <span className="text-xs text-slate-500 font-medium">No tasks in this stage</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
