import { ProjectItem, ExportItem } from '../types';
import { TEMPLATES } from './templates';

// Root storage directories for local-first device storage system
export const STORAGE_ROOT = 'PDF Studio/';
export const STORAGE_PROJECTS_DIR = 'PDF Studio/Projects/';
export const STORAGE_EXPORTS_DIR = 'PDF Studio/Exports/';

const PROJECTS_INDEX_KEY = `${STORAGE_ROOT}projects_index`;
const EXPORTS_INDEX_KEY = `${STORAGE_ROOT}exports_index`;

// Helper: Format raw byte count into dynamic human-readable string (KB / MB)
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(0);
    return `${kb} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${mb} MB`;
}

// Calculate approximate byte size of a project or document content
export function calculateContentSizeBytes(content: string | object): number {
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  // Using Blob or TextEncoder to compute accurate UTF-8 byte length
  if (typeof Blob !== 'undefined') {
    return new Blob([str]).size;
  }
  return new TextEncoder().encode(str).length;
}

// Ensure the storage directory structure is initialized
export function initDeviceStorage(): void {
  try {
    if (!localStorage.getItem(PROJECTS_INDEX_KEY)) {
      // Seed an initial welcome project in "PDF Studio/Projects/"
      const defaultProject: ProjectItem = {
        id: 'proj_default_welcome',
        name: 'Executive Document Summary',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 1800000,
        pages: [
          {
            id: 'page_1',
            content: TEMPLATES.default,
          },
        ],
        pageSize: 'a4',
        marginSize: '24px',
        activeFont: 'Arial',
        activeFontSize: '3',
        isDraft: false,
      };

      const projectPath = `${STORAGE_PROJECTS_DIR}${defaultProject.id}`;
      localStorage.setItem(projectPath, JSON.stringify(defaultProject));
      localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify([defaultProject.id]));
    }

    if (!localStorage.getItem(EXPORTS_INDEX_KEY)) {
      localStorage.setItem(EXPORTS_INDEX_KEY, JSON.stringify([]));
    }
  } catch (err) {
    console.warn('Could not initialize local device storage:', err);
  }
}

// Retrieve all projects from "PDF Studio/Projects/"
export function getAllProjects(): ProjectItem[] {
  try {
    const indexRaw = localStorage.getItem(PROJECTS_INDEX_KEY);
    if (!indexRaw) return [];
    const ids: string[] = JSON.parse(indexRaw);
    const list: ProjectItem[] = [];

    ids.forEach((id) => {
      const key = `${STORAGE_PROJECTS_DIR}${id}`;
      const itemRaw = localStorage.getItem(key);
      if (itemRaw) {
        try {
          const item: ProjectItem = JSON.parse(itemRaw);
          list.push(item);
        } catch {
          // ignore corrupted item
        }
      }
    });

    // Sort newest updated first
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('Error reading projects:', err);
    return [];
  }
}

// Get non-draft projects
export function getSavedProjects(): ProjectItem[] {
  return getAllProjects().filter((p) => !p.isDraft);
}

// Get drafts
export function getDraftProjects(): ProjectItem[] {
  return getAllProjects().filter((p) => p.isDraft);
}

// Save or update a project into "PDF Studio/Projects/<id>" with optimized payload
export function saveProjectToStorage(project: ProjectItem): void {
  try {
    const key = `${STORAGE_PROJECTS_DIR}${project.id}`;

    // Optimization: Store only essential data, no redundant caches
    const cleanPayload: ProjectItem = {
      id: project.id,
      name: project.name.trim() || 'Untitled Project',
      createdAt: project.createdAt || Date.now(),
      updatedAt: Date.now(),
      pages: project.pages.map((p) => ({
        id: p.id,
        content: p.content,
      })),
      pageSize: project.pageSize,
      marginSize: project.marginSize,
      activeFont: project.activeFont,
      activeFontSize: project.activeFontSize,
      isDraft: !!project.isDraft,
    };

    localStorage.setItem(key, JSON.stringify(cleanPayload));

    // Update index
    const indexRaw = localStorage.getItem(PROJECTS_INDEX_KEY);
    const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!ids.includes(project.id)) {
      ids.unshift(project.id);
      localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error('Error saving project to device storage:', err);
  }
}

// Delete project and corresponding storage data in "PDF Studio/Projects/"
export function deleteProjectFromStorage(projectId: string): void {
  try {
    const key = `${STORAGE_PROJECTS_DIR}${projectId}`;
    localStorage.removeItem(key);

    const indexRaw = localStorage.getItem(PROJECTS_INDEX_KEY);
    if (indexRaw) {
      const ids: string[] = JSON.parse(indexRaw);
      const updated = ids.filter((id) => id !== projectId);
      localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error deleting project from device storage:', err);
  }
}

// Duplicate an existing project
export function duplicateProjectInStorage(sourceProject: ProjectItem): ProjectItem {
  const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const copyName = `${sourceProject.name} (Copy)`;

  const newProject: ProjectItem = {
    ...sourceProject,
    id: newId,
    name: copyName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pages: sourceProject.pages.map((p, idx) => ({
      id: `page_${Date.now()}_${idx}`,
      content: p.content,
    })),
    isDraft: false,
  };

  saveProjectToStorage(newProject);
  return newProject;
}

// Log exported PDF metadata into "PDF Studio/Exports/"
export function logExportRecord(record: ExportItem): void {
  try {
    const key = `${STORAGE_EXPORTS_DIR}${record.id}`;
    localStorage.setItem(key, JSON.stringify(record));

    const indexRaw = localStorage.getItem(EXPORTS_INDEX_KEY);
    const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!ids.includes(record.id)) {
      ids.unshift(record.id);
      localStorage.setItem(EXPORTS_INDEX_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error('Error logging export record:', err);
  }
}
