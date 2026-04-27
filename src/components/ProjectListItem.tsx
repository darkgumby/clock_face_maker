import { type FC, useState } from "react";
import { type ProjectRecord as Project } from "../hooks/useProjects";

interface ProjectListItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: (project: Project) => void;
  onDelete: (id: string) => Promise<void>;
  isOnlyProject: boolean; // New prop
}

const ProjectListItem: FC<ProjectListItemProps> = ({ project, isSelected, onSelect, onDelete, isOnlyProject }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent project selection when clicking delete
    setIsDeleting(true);
    try {
      await onDelete(project.id);
    } catch (error) {
      console.error("Failed to delete project:", error);
      // Handle UI feedback for deletion error if needed
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <li
      key={project.id}
      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
        isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-700"
      }`}
      onClick={() => onSelect(project)}
    >
      <div className="flex-1 mr-2 truncate">
        <p className={`font-medium ${isSelected ? "" : "text-gray-200"}`}>{project.name}</p>
      </div>
      {!isOnlyProject && ( // Conditionally render the delete button
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting} // Only disable if deleting
          className={`ml-2 text-red-500 hover:text-red-400 text-xs font-bold ${isDeleting ? 'opacity-50' : ''}`}
        >
          {isDeleting ? '...' : 'X'}
        </button>
      )}
    </li>
  );
};

export default ProjectListItem;

