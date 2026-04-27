import { type FC } from "react";
import ColorPicker from "./ColorPicker";
import { UnitPreference } from "../hooks/useSettings";
import { type FaceShape } from "../lib/generateSvg";

const MM_PER_INCH = 25.4;

function toFractionInches(inches: number): string {
  const denom = 16;
  const whole = Math.floor(Math.abs(inches));
  const frac = Math.abs(inches) - whole;
  let num = Math.round(frac * denom);
  if (num === denom) return `${whole + 1}"`;
  if (num === 0) return `${whole}"`;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(num, denom);
  num = num / g;
  const den = denom / g;
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

// Define types for the parameters object
interface ParameterPanelProps {
  params: {
    diameter: number;
    face_shape: FaceShape;
    corner_radius: number;
    face_color: string;
    border_color: string;
    border_width: number;
    mark_color: string;
    hour_mark_length: number;
    hour_mark_width: number;
    cardinal_marks_only: boolean;
    show_minute_marks: boolean;
    minute_mark_length: number;
    minute_mark_width: number;
    show_numbers: boolean;
    number_mark_gap: number;
    number_font: string;
    number_size: number;
    number_font_weight: number;
    number_font_italic: boolean;
    center_hole_diameter: number;
    mark_border_gap: number;
  };
  onChange: (params: Partial<ParameterPanelProps["params"]>) => void;
  currentProject: any;
  unitPreference: UnitPreference;
  onSetUnitPreference: (unit: UnitPreference) => void;
}

// Helper component for InputRange to handle unit conversion and display
const UnitInputRange: FC<{
  label: string;
  value: number; // Value is always stored in mm internally
  onChange: (valueInMm: number) => void;
  minMm: number;
  maxMm: number;
  stepMm: number;
  unit: UnitPreference; // Current unit system ('mm' or 'in')
}> = ({ label, value, onChange, minMm, maxMm, stepMm, unit }) => {
  const inches = value / MM_PER_INCH;
  const sliderMin = unit === "in" ? minMm / MM_PER_INCH : minMm;
  const sliderMax = unit === "in" ? maxMm / MM_PER_INCH : maxMm;
  const sliderStep = unit === "in" ? stepMm / MM_PER_INCH : stepMm;
  const sliderValue = unit === "in" ? inches : value;
  const displayValue = unit === "in" ? toFractionInches(inches) : `${value.toFixed(1)}`;

  const handleValueChange = (v: number) => {
    onChange(unit === "in" ? v * MM_PER_INCH : v);
  };

  return (
    <div className="flex flex-col gap-y-1 text-sm">
      <label className="text-gray-300 flex items-center justify-between">
        {label}
        <span className="text-xs text-gray-500">{unit.toUpperCase()}</span>
      </label>
      <div className="flex items-center gap-x-2">
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={sliderValue}
          onChange={(e) => handleValueChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 appearance-none bg-gray-600 rounded-lg cursor-pointer"
        />
        <span className="text-gray-400 w-16 text-right text-xs">{displayValue}</span>
      </div>
    </div>
  );
};


const ParameterPanel: FC<ParameterPanelProps> = ({
  params,
  onChange,
  currentProject,
  unitPreference,
  onSetUnitPreference,
}) => {
  const handleUnitChange = (unit: UnitPreference) => {
    onSetUnitPreference(unit);
  };

  // These values are assumed to be in millimeters internally
  const diameterMm = params.diameter;
  const borderWidthMm = params.border_width;
  const hourMarkLengthMm = params.hour_mark_length;
  const hourMarkWidthMm = params.hour_mark_width;
  const minuteMarkLengthMm = params.minute_mark_length;
  const minuteMarkWidthMm = params.minute_mark_width;


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
              onClick={() => handleUnitChange("mm")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${unitPreference === "mm"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
              }`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange("in")}
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

      {/* Parameters */}
      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Face</h3>
        <UnitInputRange
          label="Diameter"
          value={diameterMm}
          onChange={(v) => onChange({ diameter: v })}
          minMm={100} maxMm={600} stepMm={10}
          unit={unitPreference}
        />
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
          value={borderWidthMm}
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

      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</h3>
        <ColorInput
          label="Mark Color"
          value={params.mark_color}
          onChange={(v) => onChange({ mark_color: v })}
        />
        <UnitInputRange
          label="Border Gap"
          value={params.mark_border_gap}
          onChange={(v) => onChange({ mark_border_gap: v })}
          minMm={0} maxMm={20} stepMm={0.5}
          unit={unitPreference}
        />
        <UnitInputRange
          label="Hour Mark Length"
          value={hourMarkLengthMm}
          onChange={(v) => onChange({ hour_mark_length: v })}
          minMm={5} maxMm={30} stepMm={1}
          unit={unitPreference}
        />
        <UnitInputRange
          label="Hour Mark Width"
          value={hourMarkWidthMm}
          onChange={(v) => onChange({ hour_mark_width: v })}
          minMm={1} maxMm={5} stepMm={0.5}
          unit={unitPreference}
        />
        <BooleanToggle
          label="Cardinal Marks Only"
          value={params.cardinal_marks_only}
          onChange={(v) => onChange({ cardinal_marks_only: v })}
        />
        <BooleanToggle
          label="Show Minute Marks"
          value={params.show_minute_marks}
          onChange={(v) => onChange({ show_minute_marks: v })}
        />
        {params.show_minute_marks && (
          <>
            <UnitInputRange
              label="Minute Mark Length"
              value={minuteMarkLengthMm}
              onChange={(v) => onChange({ minute_mark_length: v })}
              minMm={1} maxMm={15} stepMm={1}
              unit={unitPreference}
            />
            <UnitInputRange
              label="Minute Mark Width"
              value={minuteMarkWidthMm}
              onChange={(v) => onChange({ minute_mark_width: v })}
              minMm={0.5} maxMm={3} stepMm={0.5}
              unit={unitPreference}
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Numbers</h3>
        <BooleanToggle
          label="Show Numbers"
          value={params.show_numbers}
          onChange={(v) => onChange({ show_numbers: v })}
        />
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

// --- Placeholder Components ---
// These would be imported from a UI library or defined elsewhere.
// For now, providing basic implementations for demonstration.

// Modified InputRange to accept min/max/step and display value as is (for non-converted units like number size)
const InputRange: FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}> = ({ label, value, onChange, min, max, step }) => (
  <div className="flex flex-col gap-y-1 text-sm">
    <label className="text-gray-300">{label}</label>
    <div className="flex items-center gap-x-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 appearance-none bg-gray-600 rounded-lg cursor-pointer"
      />
      <span className="text-gray-400 w-12 text-right">{value}</span>
    </div>
  </div>
);

const ColorInput: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-y-1 text-sm">
    <label className="text-gray-300">{label}</label>
    <div className="flex items-center gap-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 border-none rounded-md cursor-pointer"
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500"
      />
    </div>
  </div>
);

const BooleanToggle: FC<{
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between text-sm">
    <label className="text-gray-300">{label}</label>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? "bg-blue-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default ParameterPanel;
