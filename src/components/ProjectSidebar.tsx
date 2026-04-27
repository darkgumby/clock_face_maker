import { type FC, useState } from "react";
import ProjectListItem from "./ProjectListItem";
import Button from "./Button";
import { type ProjectRecord as Project } from "../hooks/useProjects";

interface ProjectSidebarProps {
  projects: Project[];
  loading: boolean;
  currentProject: Project | null;
  onSelect: (project: Project) => void;
  onCreate: (name: string, description?: string) => Promise<Project>;
  onDelete: (id: string) => Promise<void>;
  projectsError?: string | null;
}

const ProjectSidebar: FC<ProjectSidebarProps> = ({
  projects,
  loading,
  currentProject,
  onSelect,
  onCreate,
  onDelete,
  projectsError,
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    try {
      const newProject = await onCreate(projectName, projectDescription);
      onSelect(newProject);
      setProjectName("");
      setProjectDescription("");
      setIsCreatingProject(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleCreateProjectCancel = () => {
    setProjectName("");
    setProjectDescription("");
    setIsCreatingProject(false);
  };

  return (
    <div className="p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Projects</h2>

      {!isCreatingProject ? (
        <Button onClick={() => setIsCreatingProject(true)} variant="secondary" className="mb-4">
          + New Project
        </Button>
      ) : (
        <div className="mb-4 p-2 border border-gray-600 rounded bg-gray-900">
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full text-sm bg-transparent border-none focus:outline-none text-gray-200 mb-1"
          />
          <div className="flex justify-end gap-x-2">
            <Button onClick={handleCreateProjectCancel} variant="subtle">Cancel</Button>
            <Button onClick={handleCreateProject} disabled={!projectName.trim()}>Create</Button>
          </div>
          </div>
          )}

          {loading && <p className="text-gray-400 text-sm">Loading projects...</p>}
          {projectsError && <p className="text-red-500 text-sm">{projectsError}</p>}
          {!loading && !projectsError && (
          <ul>          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              isSelected={currentProject?.id === project.id}
              onSelect={onSelect}
              onDelete={onDelete}
              isOnlyProject={projects.length === 1}
            />
          ))}
          {projects.length === 0 && <p className="text-gray-400 text-sm">No projects yet.</p>}
        </ul>
      )}
    </div>
  );
};

export default ProjectSidebar;
