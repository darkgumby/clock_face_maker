import { type FC, type ReactNode, useState } from "react";

interface CollapsiblePanelProps {
  title: string;
  borderSide: "left" | "right";
  width?: string;
  children: ReactNode;
}

const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
  title,
  borderSide,
  width = "w-64",
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const borderClass = borderSide === "left" ? "border-r border-gray-700" : "border-l border-gray-700";
  const expandIcon = borderSide === "left" ? "›" : "‹";
  const collapseIcon = borderSide === "left" ? "‹" : "›";

  return (
    <div className={`${collapsed ? "w-10" : width} shrink-0 bg-gray-800 ${borderClass} h-screen overflow-hidden flex flex-col transition-[width] duration-200`}>
      <div className={`flex items-center px-3 py-3 border-b border-gray-700 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-400 hover:text-white text-sm leading-none"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? expandIcon : collapseIcon}
        </button>
      </div>

      {collapsed ? (
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-xs font-semibold text-gray-500 uppercase tracking-wider select-none"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {title}
          </span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsiblePanel;
