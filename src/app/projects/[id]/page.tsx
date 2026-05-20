'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import { 
  FolderKanban, 
  Plus, 
  ChevronRight, 
  Users, 
  ArrowLeft,
  Loader2,
  Calendar,
  ShieldAlert,
  ClipboardList
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

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: User;
  members: User[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  // Unwrap params using React.use
  const { id: projectId } = React.use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: 'ADMIN' | 'MEMBER' } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Parallel fetches for project detail and project tasks
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tasks`),
      ]);

      if (projectRes.ok && tasksRes.ok) {
        const projectData = await projectRes.json();
        const tasksData = await tasksRes.json();
        setProject(projectData);
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
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

    fetchData();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Optimistic update or quick refetch
        const updatedTask = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
        );
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse text-slate-400">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <FolderKanban className="w-12 h-12 text-slate-600 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-300">Project Not Found</h2>
          <Link href="/projects" className="text-xs font-semibold text-indigo-400 hover:underline">
            Go back to projects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
        {/* Background gradients */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />

        {/* Breadcrumbs and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/projects" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-slate-300 font-semibold truncate max-w-[200px]">{project.name}</span>
          </div>

          {/* Admin action to launch TaskModal */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all text-white text-xs font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Add Task
            </button>
          )}
        </div>

        {/* Project Header Info Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              {project.name}
            </h1>
            {project.description ? (
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">No description provided for this project.</p>
            )}
          </div>

          {/* Quick info right panel */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Created by */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-left">
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                Created By
              </span>
              <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                {project.createdBy.name}
              </span>
            </div>

            {/* Team Members stack list */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-left">
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                <Users className="w-3 h-3 text-slate-500" />
                Team Size
              </div>
              <span className="text-xs text-slate-300 font-semibold mt-0.5 block font-mono">
                {project.members.length} Members
              </span>
            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-200">Task Board</h2>
              <p className="text-xs text-slate-500 mt-0.5">Drag, complete, and update project tasks in real time</p>
            </div>
          </div>

          <KanbanBoard
            tasks={tasks}
            currentUser={currentUser}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {/* Task Modal Trigger */}
      {isTaskModalOpen && (
        <TaskModal
          projectId={project.id}
          projectMembers={project.members}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={() => {
            setIsTaskModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
