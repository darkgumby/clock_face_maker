import { useState } from "react";
import {
  loadProjects,
  createProject as storageCreate,
  updateProject,
  deleteProject as storageDelete,
  type StoredProject,
} from "../lib/storage";
import { UnitPreference } from "../hooks/useSettings";

export interface ClockParams {
  diameter?: number;
  face_color?: string;
  border_color?: string;
  border_width?: number;
  mark_color?: string;
  hour_mark_length?: number;
  hour_mark_width?: number;
  show_minute_marks?: boolean;
  minute_mark_length?: number;
  minute_mark_width?: number;
  show_numbers?: boolean;
  number_font?: string;
  number_size?: number;
  number_font_weight?: number;
  number_font_italic?: boolean;
  number_roman?: boolean;
  number_mark_gap?: number;
  center_hole_diameter?: number;
  cardinal_marks_only?: boolean;
}

export type ProjectRecord = StoredProject & { params: ClockParams | null; unit_preference: UnitPreference };

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => loadProjects() as ProjectRecord[]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const createProject = async (name: string, description = ""): Promise<ProjectRecord> => {
    const project = storageCreate(name, description) as ProjectRecord;
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const updateProjectParams = async (id: string, params: ClockParams) => {
    const updated = updateProject(id, { params: params as Record<string, unknown> });
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === id ? (updated as ProjectRecord) : p)));
    }
  };

  const updateProjectUnitPreference = async (id: string, unit: UnitPreference) => {
    const updated = updateProject(id, { unit_preference: unit });
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === id ? (updated as ProjectRecord) : p)));
    }
  };

  const deleteProject = async (id: string) => {
    storageDelete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, loading, error, createProject, updateProjectParams, updateProjectUnitPreference, deleteProject };
}
