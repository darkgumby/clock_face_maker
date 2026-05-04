import { useEffect, useMemo, useRef, useState } from "react";
import ParameterPanel from "../components/ParameterPanel";
import MarksPanel from "../components/MarksPanel";
import FontPanel from "../components/FontPanel";
import ProjectSidebar from "../components/ProjectSidebar";
import SvgPreview from "../components/SvgPreview";
import CollapsiblePanel from "../components/CollapsiblePanel";
import Button from "../components/Button";
import HelpDialog from "../components/HelpDialog";
import { generateSvg } from "../lib/generateSvg";
import { embedGoogleFont } from "../lib/embedFont";
import { convertTextToPaths, getRequiredChars } from "../lib/textToPath";
import { svgToPng } from "../lib/exportPng";
import { GOOGLE_FONTS } from "../components/FontPicker";
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
  number_font: GOOGLE_FONTS[0],
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

  const [showInitModal, setShowInitModal] = useState(false);
  const [pendingInitProject, setPendingInitProject] = useState<ProjectRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [params, setParams] = useState<Params>({ ...DEFAULT_PARAMS, number_font: defaultFont });
  const [svgError, setSvgError] = useState<string | null>(null);
  const [downloadingFont, setDownloadingFont] = useState(false);

  const unitPreference: UnitPreference = (currentProject?.unit_preference as UnitPreference) || "mm";

  const hasCreatedDefaultProject = useRef(false);

  const defaultFontRef = useRef(defaultFont);
  useEffect(() => { defaultFontRef.current = defaultFont; }, [defaultFont]);

  const svgContent = useMemo(() => {
    try {
      setSvgError(null);
      return generateSvg({ ...params, unit_preference: unitPreference });
    } catch (error) {
      console.error("SVG Generation Error:", error);
      setSvgError("Failed to generate SVG.");
      return null;
    }
  }, [params, unitPreference]);

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
        
        // If we're in the middle of creating a project, don't auto-switch yet
        if (showInitModal) return;

        const lastSelected = projects.find(p => p.id === lastSelectedProjectId);
        if (lastSelected) {
          setCurrentProject(lastSelected);
        } else {
          setCurrentProject(projects[0]);
          setLastSelectedProjectId(projects[0].id);
        }
      }
    }
  }, [projects, projectsLoading, settingsLoading, lastSelectedProjectId, createProject, setLastSelectedProjectId, showInitModal]);

  useEffect(() => {
    if (showInitModal) return; // Wait for user choice

    const base: Params = { ...DEFAULT_PARAMS, number_font: defaultFontRef.current };
    setParams(currentProject?.params ? { ...base, ...currentProject.params } : base);
  }, [currentProject?.id, defaultFontRef.current, showInitModal]);

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

  const handleCreateProjectAction = async (name: string, description?: string) => {
    setShowInitModal(true); // Set immediately to block auto-switching useEffects
    try {
      const newProject = await createProject(name, description);
      setPendingInitProject(newProject);
      return newProject;
    } catch (err) {
      console.error("Failed to create project:", err);
      setShowInitModal(false);
      throw err;
    }
  };

  const handleInitCancel = () => {
    if (pendingInitProject) {
      deleteProject(pendingInitProject.id);
    }
    setShowInitModal(false);
    setPendingInitProject(null);
  };

  const handleInitChoice = (choice: "default" | "current") => {
    if (!pendingInitProject) {
      setShowInitModal(false);
      return;
    }

    const initParams = choice === "default" ? { ...DEFAULT_PARAMS } : params;

    setParams(initParams);
    updateProjectParams(pendingInitProject.id, initParams);
    const projectWithParams = { ...pendingInitProject, params: initParams };
    handleSelectProject(projectWithParams as typeof pendingInitProject);
    setShowInitModal(false);
    setPendingInitProject(null);
  };

  const handleDeleteRequest = async (id: string) => {
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const allErrors = [projectsError, settingsError, svgError].filter(Boolean).join(" ");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100 relative">
      {showInitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">New Project Created</h3>
            <p className="text-gray-400 text-sm mb-6">
              Would you like to start with the default clock settings, or keep your current values?
            </p>
            <div className="flex flex-col gap-y-2">
              <Button onClick={() => handleInitChoice("default")} variant="primary" className="w-full py-2">
                Use Default Settings
              </Button>
              <Button onClick={() => handleInitChoice("current")} variant="secondary" className="w-full py-2">
                Keep Current Settings
              </Button>
              <Button onClick={handleInitCancel} variant="secondary" className="w-full py-2 opacity-60 hover:opacity-100">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Project?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently remove the project and all its snapshots. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-y-2">
              <Button onClick={confirmDelete} variant="danger" className="w-full py-2">
                Delete Project
              </Button>
              <Button onClick={() => setShowDeleteModal(false)} variant="secondary" className="w-full py-2">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <CollapsiblePanel title="Projects" borderSide="left">
        <ProjectSidebar
          projects={projects}
          loading={projectsLoading || settingsLoading}
          currentProject={currentProject}
          onSelect={handleSelectProject}
          onCreate={handleCreateProjectAction}
          onDelete={handleDeleteRequest}
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
        onHelp={() => setShowHelp(true)}
      />

      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}

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
