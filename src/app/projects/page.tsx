'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProjectModal from '@/components/ProjectModal';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Loader2,
  ListTodo
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface Task {
  id: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: User;
  members: User[];
  tasks: Task[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: 'ADMIN' | 'MEMBER' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read session user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    }

    fetchProjects();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse text-slate-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Background gradients */}
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Workspace Projects
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Create, view, and organize collaborative project workspaces
            </p>
          </div>

          {/* Admin Create Action */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white text-sm font-semibold shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              New Project
            </button>
          )}
        </div>

        {/* Project Cards Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const totalTasks = project.tasks.length;
              const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
              const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <Link
                  href={`/projects/${project.id}`}
                  key={project.id}
                  className="group bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-slate-700/80 hover:bg-slate-900/50 hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(project.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors leading-snug">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 mt-6 border-t border-slate-800/60">
                    {/* Tasks progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400 flex items-center gap-1">
                          <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                          Tasks Progress
                        </span>
                        <span className="text-slate-300 font-mono">
                          {completedTasks}/{totalTasks} ({completionRate}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 border border-slate-900/80 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Creator and Members overlay */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="w-4 h-4 text-slate-600" />
                        <span>{project.members.length} members</span>
                      </div>

                      {/* Overlapping member circles */}
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members.slice(0, 3).map((member, i) => (
                          <div
                            key={member.id}
                            className="inline-block h-6 w-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-indigo-400 font-mono shadow-sm"
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="inline-block h-6 w-6 rounded-full bg-indigo-950 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-indigo-300 font-mono shadow-sm">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-base font-bold text-slate-300">No projects found</h3>
            <p className="text-sm text-slate-500 text-center max-w-[340px] mt-1 leading-relaxed">
              {currentUser?.role === 'ADMIN'
                ? 'Get started by creating a new project workspace and inviting your team.'
                : 'You have not been assigned to any projects yet. Ask an Administrator to invite you.'}
            </p>
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white text-xs font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
                Create First Project
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
