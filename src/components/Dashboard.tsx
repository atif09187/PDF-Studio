import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  FileText,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  HardDrive,
  Sparkles,
  Folder,
  CheckCircle,
} from 'lucide-react';
import { ProjectItem } from '../types';

interface DashboardProps {
  projects: ProjectItem[];
  drafts: ProjectItem[];
  logoSrc: string;
  logoLoadFailed: boolean;
  onLogoError: () => void;
  onOpenProject: (project: ProjectItem) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: ProjectItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  drafts,
  logoSrc,
  logoLoadFailed,
  onLogoError,
  onOpenProject,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
}) => {
  // Modal states
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');

  // Three-dots menu popover state
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);

  // Delete confirmation state
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);

  // Tab filtering: 'projects' vs 'drafts'
  const [activeTab, setActiveTab] = useState<'projects' | 'drafts'>('projects');

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close three-dots menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuProjectId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autofocus input when New Project modal opens
  useEffect(() => {
    if (showNewModal) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [showNewModal]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newProjectName.trim() || 'Untitled Project';
    onCreateProject(finalName);
    setNewProjectName('');
    setShowNewModal(false);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-y-auto">
      {/* 1. Header Bar */}
      <header
        id="dashboard-header"
        className="h-14 flex items-center justify-between px-3 sm:px-5 bg-slate-900 border-b border-slate-800 shrink-0 z-20 shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          {!logoLoadFailed ? (
            <img
              src={logoSrc}
              alt="PDF Studio Logo"
              onError={onLogoError}
              className="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-750 p-0.5 shrink-0 shadow-inner"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-sky-400 stroke-[2.2]" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base tracking-tight text-white leading-tight">
              PDF Studio
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              By Ch Atif Gondal
            </span>
          </div>
        </div>

        {/* Action: Clear "+" Create Project Button */}
        <button
          id="createProjectBtn"
          type="button"
          onClick={() => {
            setNewProjectName('');
            setShowNewModal(true);
          }}
          className="h-9 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl px-3.5 sm:px-4 flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </header>

      {/* 2. Sub-Header: Device Storage Path & Filter Tabs */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Storage location badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          <span>Storage:</span>
          <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            PDF Studio/Projects/
          </span>
        </div>

        {/* Projects / Drafts Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drafts ({drafts.length})
          </button>
        </div>
      </div>

      {/* 3. Main Project List Container */}
      <main className="flex-1 p-4 sm:p-5 flex flex-col gap-4">
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Recent Projects
              </h2>
              <span className="text-xs text-slate-500">
                {projects.length} {projects.length === 1 ? 'file' : 'files'}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">No projects yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click the button below to create your first blank PDF file
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="mt-1 h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col justify-between relative shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => onOpenProject(project)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-400">
                          <FileText className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Three-dots Menu button */}
                      <div
                        className="relative shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          title="Project Options"
                          onClick={() =>
                            setActiveMenuProjectId(
                              activeMenuProjectId === project.id ? null : project.id
                            )
                          }
                          className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuProjectId === project.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-9 z-30 w-44 bg-slate-900 border border-slate-750 rounded-xl shadow-xl shadow-black/60 py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuProjectId(null);
                                onDuplicateProject(project);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-sky-400" />
                              <span>Duplicate Project</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuProjectId(null);
                                setProjectToDelete(project);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer border-t border-slate-800/80"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Project</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-850 text-[11px] text-slate-400">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {project.pages?.length || 1}{' '}
                        {project.pages?.length === 1 ? 'page' : 'pages'}
                      </span>
                      <span className="uppercase tracking-wider text-[10px] text-slate-500">
                        {project.pageSize || 'A4'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drafts Section */}
        {activeTab === 'drafts' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Auto-saved Drafts
              </h2>
              <span className="text-xs text-slate-500">
                {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
              </span>
            </div>

            {drafts.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-white">No active drafts</p>
                <p className="text-xs text-slate-400">
                  When you edit a document, your changes are continuously auto-saved as working drafts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col justify-between relative shadow-sm cursor-pointer"
                    onClick={() => onOpenProject(draft)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                          <FileText className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                            {draft.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Draft &bull; {formatDate(draft.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="relative shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuProjectId(
                              activeMenuProjectId === draft.id ? null : draft.id
                            )
                          }
                          className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuProjectId === draft.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-9 z-30 w-44 bg-slate-900 border border-slate-750 rounded-xl shadow-xl shadow-black/60 py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuProjectId(null);
                                onDuplicateProject(draft);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-sky-400" />
                              <span>Duplicate Draft</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuProjectId(null);
                                setProjectToDelete(draft);
                              }}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer border-t border-slate-800/80"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Draft</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-850 text-[11px] text-slate-400">
                      <span className="bg-amber-950/50 text-amber-300 px-2 py-0.5 rounded border border-amber-800/50">
                        In-progress draft
                      </span>
                      <span className="text-indigo-400 font-medium">Continue &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. New Project Creation Modal (Requirement 3) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-6 shadow-2xl shadow-black/80 flex flex-col gap-4 text-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Create New Project</h3>
                <p className="text-xs text-slate-400">Enter a permanent file name for your document</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectNameInput" className="text-xs font-semibold text-slate-300">
                Project Name
              </label>
              <input
                id="projectNameInput"
                ref={inputRef}
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Business Proposal, Resume, Invoice"
                className="h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-750 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                maxLength={80}
              />
              <span className="text-[11px] text-slate-400">
                Saved in <code className="text-slate-300">PDF Studio/Projects/</code>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="createBlankFileBtn"
                type="submit"
                className="h-10 px-5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Blank File</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Delete Project Confirmation Modal (Requirement 4) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/80 flex flex-col gap-4 text-slate-100 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Delete Project?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to delete <strong className="text-white font-semibold">"{projectToDelete.name}"</strong>?
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                The corresponding file in <span className="font-mono">PDF Studio/Projects/</span> will be permanently removed.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
