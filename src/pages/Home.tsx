import { useEffect, useMemo, useRef, useState } from "react";
import ParameterPanel from "../components/ParameterPanel";
import FontPanel from "../components/FontPanel";
import ProjectSidebar from "../components/ProjectSidebar";
import SvgPreview from "../components/SvgPreview";
import { generateSvg } from "../lib/generateSvg";
import { useProjects, type ProjectRecord } from "../hooks/useProjects";
import { useSettings, UnitPreference } from "../hooks/useSettings";

const DEFAULT_PARAMS = {
  diameter: 250,
  face_shape: "circle" as import("../lib/generateSvg").FaceShape,
  corner_radius: 20,
  face_color: "#ffffff",
  border_color: "#ffffff",
  border_width: 5,
  mark_color: "#000000",
  hour_mark_length: 18,
  hour_mark_width: 3,
  show_minute_marks: true,
  minute_mark_length: 8,
  minute_mark_width: 1,
  show_numbers: true,
  number_font: "Roboto",
  number_size: 20,
  number_font_weight: 400,
  number_font_italic: false,
  number_roman: false,
  number_mark_gap: 16,
  center_hole_diameter: 8,
  cardinal_marks_only: false,
  mark_border_gap: 2,
};

type Params = typeof DEFAULT_PARAMS;

export default function Home() {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    deleteProject,
    updateProjectParams,
    updateProjectUnitPreference,
  } = useProjects();
  const [currentProject, setCurrentProject] = useState<ProjectRecord | null>(null);
  const {
    defaultFont,
    setDefaultFont,
    lastSelectedProjectId,
    setLastSelectedProjectId,
    loading: settingsLoading,
    error: settingsError
  } = useSettings();

  const unitPreference: UnitPreference = (currentProject?.unit_preference as UnitPreference) || "mm";

  const hasCreatedDefaultProject = useRef(false);

  const defaultFontRef = useRef(defaultFont);
  useEffect(() => { defaultFontRef.current = defaultFont; }, [defaultFont]);

  const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS, number_font: defaultFont });
  const [svgError, setSvgError] = useState<string | null>(null);

  const svgContent = useMemo(() => {
    try {
      setSvgError(null);
      return generateSvg(params);
    } catch (error) {
      console.error("SVG Generation Error:", error);
      setSvgError("Failed to generate SVG.");
      return null;
    }
  }, [params]);

  useEffect(() => {
    if (!projectsLoading && !settingsLoading && projects !== null) {
      if (projects.length === 0 && !hasCreatedDefaultProject.current) {
        hasCreatedDefaultProject.current = true;
        createProject("default").then(newProject => {
          setCurrentProject(newProject);
          setLastSelectedProjectId(newProject.id);
        });
      } else if (projects.length > 0) {
        hasCreatedDefaultProject.current = false;
        const lastSelected = projects.find(p => p.id === lastSelectedProjectId);
        if (lastSelected) {
          setCurrentProject(lastSelected);
        } else {
          setCurrentProject(projects[0]);
          setLastSelectedProjectId(projects[0].id);
        }
      }
    }
  }, [projects, projectsLoading, settingsLoading, lastSelectedProjectId, createProject, setLastSelectedProjectId]);

  useEffect(() => {
    const base: Params = { ...DEFAULT_PARAMS, number_font: defaultFontRef.current };
    setParams(currentProject?.params ? { ...base, ...currentProject.params } : base);
  }, [currentProject?.id, defaultFontRef.current]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentProjectRef = useRef(currentProject);
  useEffect(() => { currentProjectRef.current = currentProject; }, [currentProject]);
  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);

  const flushSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (currentProjectRef.current) {
      updateProjectParams(currentProjectRef.current.id, paramsRef.current);
    }
  };

  const handleParamsChange = (partial: Partial<Params>) => {
    setParams((prev) => {
      const next = { ...prev, ...partial };
      if (currentProjectRef.current) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          updateProjectParams(currentProjectRef.current!.id, next);
        }, 600);
      }
      return next;
    });
  };

  const handleUnitPreferenceChange = (unit: UnitPreference) => {
    if (currentProject) {
      updateProjectUnitPreference(currentProject.id, unit);
    }
  };

  const handleSelectProject = (project: ProjectRecord) => {
    flushSave();
    setCurrentProject(project);
    setLastSelectedProjectId(project.id);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject?.name ?? "clock"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allErrors = [projectsError, settingsError, svgError].filter(Boolean).join(" ");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <ProjectSidebar
        projects={projects}
        loading={projectsLoading || settingsLoading}
        currentProject={currentProject}
        onSelect={handleSelectProject}
        onCreate={createProject}
        onDelete={deleteProject}
        projectsError={projectsError}
      />

      <SvgPreview
        svgContent={svgContent}
        onDownloadSvg={handleDownloadSvg}
        svgError={svgError}
      />

      <div className="flex flex-col w-64 shrink-0 bg-gray-800 border-l border-gray-700 h-screen overflow-hidden">
        <ParameterPanel
          params={params}
          onChange={handleParamsChange}
          currentProject={currentProject}
          unitPreference={unitPreference}
          onSetUnitPreference={handleUnitPreferenceChange}
        />
      </div>

      <FontPanel
        params={params}
        onChange={handleParamsChange}
        defaultFont={defaultFont}
        onSetDefaultFont={setDefaultFont}
      />

      {allErrors && (
        <div className="absolute bottom-4 left-4 right-4 p-2 bg-red-500 text-white rounded text-center">
          {allErrors}
        </div>
      )}
    </div>
  );
}
