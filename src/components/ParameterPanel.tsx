import { type FC, useState } from "react";
import { UnitPreference } from "../hooks/useSettings";
import { type FaceShape } from "../lib/generateSvg";
import { BooleanToggle, ColorInput, InputRange, UnitInputRange } from "./PanelControls";

interface ParameterPanelProps {
  params: {
    diameter: number;
    face_width: number;
    face_height: number;
    face_shape: FaceShape;
    corner_radius: number;
    face_color: string;
    border_color: string;
    border_width: number;
    show_numbers: boolean;
    cardinal_numbers_only: boolean;
    number_mark_gap: number;
    number_font: string;
    number_size: number;
    number_font_weight: number;
    number_font_italic: boolean;
    center_hole_diameter: number;
  };
  onChange: (params: Partial<ParameterPanelProps["params"]>) => void;
  currentProject: any;
  unitPreference: UnitPreference;
  onSetUnitPreference: (unit: UnitPreference) => void;
}

const ParameterPanel: FC<ParameterPanelProps> = ({
  params,
  onChange,
  currentProject,
  unitPreference,
  onSetUnitPreference,
}) => {
  const [lockDimensions, setLockDimensions] = useState(true);

  return (
    <div className="p-4 flex flex-col gap-y-4 overflow-y-auto h-full">
      {/* Unit Switcher */}
      <div className="flex flex-col gap-y-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</h3>
        <div className="flex items-center justify-between text-sm">
          <label className="text-gray-300">System</label>
          <div className="flex p-1 rounded-md bg-gray-700">
            <button
              type="button"
              onClick={() => onSetUnitPreference("mm")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${unitPreference === "mm"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
              }`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => onSetUnitPreference("in")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${unitPreference === "in"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
              }`}
            >
              in
            </button>
          </div>
        </div>
      </div>

      {/* Project Info */}
      {currentProject && (
        <div className="text-xs text-gray-400">
          <h3 className="font-semibold text-gray-500 uppercase tracking-wider mb-1">Project</h3>
          <p className="truncate">{currentProject.name}</p>
          {currentProject.description && <p className="truncate">{currentProject.description}</p>}
        </div>
      )}

      {/* Clock Face */}
      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Face</h3>
        {params.face_shape === "circle" ? (
          <UnitInputRange
            label="Diameter"
            value={params.diameter}
            onChange={(v) => onChange({ diameter: v })}
            minMm={100} maxMm={600} stepMm={10}
            unit={unitPreference}
          />
        ) : (
          <>
            <BooleanToggle
              label="Lock Dimensions"
              value={lockDimensions}
              onChange={(v) => {
                setLockDimensions(v);
                if (v) onChange({ face_height: params.face_width });
              }}
            />
            <UnitInputRange
              label="Width"
              value={params.face_width}
              onChange={(v) => onChange(lockDimensions ? { face_width: v, face_height: v } : { face_width: v })}
              minMm={100} maxMm={600} stepMm={10}
              unit={unitPreference}
            />
            <UnitInputRange
              label="Height"
              value={params.face_height}
              onChange={(v) => onChange(lockDimensions ? { face_width: v, face_height: v } : { face_height: v })}
              minMm={100} maxMm={600} stepMm={10}
              unit={unitPreference}
            />
          </>
        )}
        <div className="flex flex-col gap-y-1 text-sm">
          <label className="text-gray-300">Shape</label>
          <div className="flex p-1 rounded-md bg-gray-700">
            {(["circle", "square", "rounded_square"] as FaceShape[]).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => onChange({ face_shape: shape })}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  params.face_shape === shape ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                {shape === "circle" ? "Circle" : shape === "square" ? "Square" : "Rounded"}
              </button>
            ))}
          </div>
        </div>
        {params.face_shape === "rounded_square" && (
          <InputRange
            label="Corner Radius"
            value={params.corner_radius}
            onChange={(v) => onChange({ corner_radius: v })}
            min={0} max={80} step={1}
          />
        )}
        <ColorInput
          label="Face Color"
          value={params.face_color}
          onChange={(v) => onChange({ face_color: v })}
        />
        <ColorInput
          label="Border Color"
          value={params.border_color}
          onChange={(v) => onChange({ border_color: v })}
        />
        <UnitInputRange
          label="Border Width"
          value={params.border_width}
          onChange={(v) => onChange({ border_width: v })}
          minMm={1} maxMm={10} stepMm={0.5}
          unit={unitPreference}
        />
        <UnitInputRange
          label="Center Hole"
          value={params.center_hole_diameter}
          onChange={(v) => onChange({ center_hole_diameter: v })}
          minMm={2} maxMm={30} stepMm={0.5}
          unit={unitPreference}
        />
      </div>

      {/* Numbers */}
      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Numbers</h3>
        <BooleanToggle
          label="Show Numbers"
          value={params.show_numbers}
          onChange={(v) => onChange({ show_numbers: v })}
        />
        {params.show_numbers && (
          <BooleanToggle
            label="Cardinal Numbers Only"
            value={params.cardinal_numbers_only}
            onChange={(v) => onChange({ cardinal_numbers_only: v })}
          />
        )}
        {params.show_numbers && (
          <UnitInputRange
            label="Gap to Marks"
            value={params.number_mark_gap}
            onChange={(v) => onChange({ number_mark_gap: v })}
            minMm={-10} maxMm={40} stepMm={1}
            unit={unitPreference}
          />
        )}
      </div>
    </div>
  );
};

export default ParameterPanel;
