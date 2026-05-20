'use strict';
'use client';

import React, { useState } from 'react';
import { X, ClipboardList, Loader2, Calendar, User } from 'lucide-react';

interface ProjectMember {
  id: string;
  name: string;
  email: string;
}

interface TaskModalProps {
  projectId: string;
  projectMembers: ProjectMember[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskModal({ projectId, projectMembers, onClose, onSuccess }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title || !dueDate || !assigneeId) {
      setError('Title, due date, and assignee are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          dueDate,
          projectId,
          assigneeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-200">Create New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Design Dashboard Prototypes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition-all placeholder:text-slate-600 text-slate-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              placeholder="Detail the instructions or checklist for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition-all placeholder:text-slate-600 text-slate-200 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Task Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none text-slate-300 text-sm cursor-pointer [&>option]:bg-slate-900"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none text-slate-300 text-sm cursor-pointer"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Assign Task To *
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none text-slate-300 text-sm cursor-pointer [&>option]:bg-slate-900"
              required
            >
              <option value="" disabled>Select project member...</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
            {projectMembers.length === 0 && (
              <p className="text-[10px] text-amber-500/80 mt-1.5">
                Note: No members added to this project yet. Add members first.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold transition-all text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projectMembers.length === 0}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
