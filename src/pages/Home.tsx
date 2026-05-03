import { useEffect, useMemo, useRef, useState } from "react";
import ParameterPanel from "../components/ParameterPanel";
import MarksPanel from "../components/MarksPanel";
import FontPanel from "../components/FontPanel";
import ProjectSidebar from "../components/ProjectSidebar";
import SvgPreview from "../components/SvgPreview";
import CollapsiblePanel from "../components/CollapsiblePanel";
import { generateSvg } from "../lib/generateSvg";
import { embedGoogleFont } from "../lib/embedFont";
import { convertTextToPaths, getRequiredChars } from "../lib/textToPath";
import { svgToPng } from "../lib/exportPng";
import { useProjects, type ProjectRecord } from "../hooks/useProjects";
import { useSettings, UnitPreference } from "../hooks/useSettings";

const DEFAULT_PARAMS = {
  diameter: 300,
  face_width: 300,
  face_height: 300,
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
  number_font: "Abril Fatface",
  number_size: 32,
  number_font_weight: 400,
  number_font_italic: false,
  number_roman: false,
  number_mark_gap: 16,
  center_hole_diameter: 8,
  cardinal_marks_only: false,
  cardinal_numbers_only: false,
  mark_round_ends: true,
  hour_mark_style: "line" as import("../lib/generateSvg").MarkStyle,
  hour_mark_circle_diameter: 4,
  hour_mark_square_size: 5,
  hour_mark_diamond_width: 5,
  hour_mark_diamond_height: 8,
  minute_mark_style: "line" as import("../lib/generateSvg").MarkStyle,
  minute_mark_circle_diameter: 3,
  minute_mark_square_size: 3,
  minute_mark_diamond_width: 3,
  minute_mark_diamond_height: 5,
  mark_border_gap: 2,
  laser_mode: false,
  show_crosshair: false,
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
  const [downloadingFont, setDownloadingFont] = useState(false);

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

  const handleDownloadSvg = async () => {
    if (!svgContent) return;
    setDownloadingFont(true);
    let finalSvg = svgContent;
    if (params.show_numbers) {
      const chars = getRequiredChars(params.number_roman, params.cardinal_numbers_only);
      // Try text-to-path first; fall back to embedded font
      const withPaths = await convertTextToPaths(
        svgContent,
        params.number_font,
        params.number_font_weight,
        params.number_font_italic,
        chars
      );
      if (withPaths !== svgContent) {
        finalSvg = withPaths;
      } else {
        finalSvg = await embedGoogleFont(
          svgContent,
          params.number_font,
          params.number_font_weight,
          params.number_font_italic,
          chars
        );
      }
    }
    setDownloadingFont(false);
    const blob = new Blob([finalSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject?.name ?? "clock"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async () => {
    if (!svgContent) return;
    setDownloadingFont(true);
    let finalSvg = svgContent;
    if (params.show_numbers) {
      const chars = getRequiredChars(params.number_roman, params.cardinal_numbers_only);
      const withPaths = await convertTextToPaths(
        svgContent,
        params.number_font,
        params.number_font_weight,
        params.number_font_italic,
        chars
      );
      if (withPaths !== svgContent) {
        finalSvg = withPaths;
      } else {
        finalSvg = await embedGoogleFont(
          svgContent,
          params.number_font,
          params.number_font_weight,
          params.number_font_italic,
          chars
        );
      }
    }
    setDownloadingFont(false);

    const w = params.face_shape === "circle" ? params.diameter : params.face_width;
    const h = params.face_shape === "circle" ? params.diameter : params.face_height;
    const name = currentProject?.name ?? "clock";

    try {
      await svgToPng(finalSvg, w, h, `${name}.png`);
    } catch (err) {
      console.error("PNG Export Error:", err);
      setSvgError("Failed to export PNG.");
    }
  };

  const allErrors = [projectsError, settingsError, svgError].filter(Boolean).join(" ");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <CollapsiblePanel title="Projects" borderSide="left">
        <ProjectSidebar
          projects={projects}
          loading={projectsLoading || settingsLoading}
          currentProject={currentProject}
          onSelect={handleSelectProject}
          onCreate={createProject}
          onDelete={deleteProject}
          projectsError={projectsError}
        />
      </CollapsiblePanel>

      <SvgPreview
        svgContent={svgContent}
        onDownloadSvg={handleDownloadSvg}
        onDownloadPng={handleDownloadPng}
        svgError={svgError}
        downloadingFont={downloadingFont}
        unitPreference={unitPreference}
      />

      <CollapsiblePanel title="Face" borderSide="right">
        <ParameterPanel
          params={params}
          onChange={handleParamsChange}
          currentProject={currentProject}
          unitPreference={unitPreference}
          onSetUnitPreference={handleUnitPreferenceChange}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Marks" borderSide="right">
        <MarksPanel
          params={params}
          onChange={handleParamsChange}
          unitPreference={unitPreference}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Font" borderSide="right" width="w-56">
        <FontPanel
          params={params}
          onChange={handleParamsChange}
          defaultFont={defaultFont}
          onSetDefaultFont={setDefaultFont}
        />
      </CollapsiblePanel>

      {allErrors && (
        <div className="absolute bottom-4 left-4 right-4 p-2 bg-red-500 text-white rounded text-center">
          {allErrors}
        </div>
      )}
    </div>
  );
}
