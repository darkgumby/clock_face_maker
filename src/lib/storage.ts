const PROJECTS_KEY = "clock_face_maker_projects";
const SETTINGS_KEY = "clock_face_maker_settings";
const SNAPSHOTS_KEY = "clock_face_maker_snapshots";

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---- Projects ----

export interface StoredProject {
  id: string;
  name: string;
  description: string;
  params: Record<string, unknown> | null;
  unit_preference: string;
  created: string;
  updated: string;
}

export function loadProjects(): StoredProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: StoredProject[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createProject(name: string, description = ""): StoredProject {
  const project: StoredProject = {
    id: uuid(),
    name,
    description,
    params: null,
    unit_preference: "mm",
    created: now(),
    updated: now(),
  };
  const projects = loadProjects();
  projects.unshift(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id: string, patch: Partial<Omit<StoredProject, "id" | "created">>): StoredProject | null {
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...patch, updated: now() };
  saveProjects(projects);
  return projects[idx];
}

export function deleteProject(id: string): void {
  saveProjects(loadProjects().filter((p) => p.id !== id));
  // cascade delete snapshots
  saveSnapshots(loadSnapshots().filter((s) => s.project !== id));
}

// ---- Settings ----

interface Settings {
  defaultFont: string;
  lastSelectedProjectId: string | null;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { defaultFont: "Roboto", lastSelectedProjectId: null };
  } catch {
    return { defaultFont: "Roboto", lastSelectedProjectId: null };
  }
}

export function saveSettings(patch: Partial<Settings>): void {
  const current = loadSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
}

// ---- Snapshots ----

export interface StoredSnapshot {
  id: string;
  project: string;
  params: Record<string, unknown>;
  label: string;
  created: string;
  updated: string;
}

export function loadSnapshots(): StoredSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSnapshots(snapshots: StoredSnapshot[]): void {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
}

export function createSnapshot(project: string, params: Record<string, unknown>, label = ""): StoredSnapshot {
  const snapshot: StoredSnapshot = {
    id: uuid(),
    project,
    params,
    label: label || new Date().toLocaleString(),
    created: now(),
    updated: now(),
  };
  const snapshots = loadSnapshots();
  snapshots.unshift(snapshot);
  saveSnapshots(snapshots);
  return snapshot;
}

export function deleteSnapshot(id: string): void {
  saveSnapshots(loadSnapshots().filter((s) => s.id !== id));
}

export function deleteSnapshotsForProject(projectId: string): void {
  saveSnapshots(loadSnapshots().filter((s) => s.project !== projectId));
}
