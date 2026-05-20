'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Plus, UserPlus, Users, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface ProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectModal({ onClose, onSuccess }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users to assign as project members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name) {
      setError('Project name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          members: selectedMembers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
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
              <FolderKanban className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-200">Create New Project</h2>
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
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition-all placeholder:text-slate-600 text-slate-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              placeholder="Provide a brief summary of the goals and objectives of this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition-all placeholder:text-slate-600 text-slate-200 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Invite Team Members</span>
              <span className="text-[10px] text-slate-500 normal-case">
                {selectedMembers.length} selected
              </span>
            </label>

            {fetchingUsers ? (
              <div className="flex items-center justify-center py-6 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-500" />
                <span className="text-xs">Loading team users...</span>
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl bg-slate-950/30 overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-800/55">
                {users.length > 0 ? (
                  users.map((u) => {
                    const isSelected = selectedMembers.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleMember(u.id)}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all hover:bg-slate-900/50 ${
                          isSelected ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected 
                              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                              : 'bg-slate-800 border border-slate-700/80 text-slate-400'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{u.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{u.email}</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-600 text-white' 
                            : 'border-slate-800 bg-slate-950'
                        }`}>
                          {isSelected && <Plus className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 flex flex-col items-center gap-1.5">
                    <Users className="w-7 h-7 text-slate-700" />
                    <span>No members found in system.</span>
                  </div>
                )}
              </div>
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
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 text-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
