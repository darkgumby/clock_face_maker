import { type FC } from "react";
import { UnitPreference } from "../hooks/useSettings";
import { BooleanToggle, ColorInput, InputRange, UnitInputRange } from "./PanelControls";
import { type MarkStyle } from "../lib/generateSvg";

interface MarksPanelProps {
  params: {
    show_numbers: boolean;
    cardinal_numbers_only: boolean;
    number_mark_gap: number;
    mark_color: string;
    mark_border_gap: number;
    hour_mark_length: number;
    hour_mark_width: number;
    cardinal_marks_only: boolean;
    mark_round_ends: boolean;
    hour_mark_style: MarkStyle;
    hour_mark_circle_diameter: number;
    hour_mark_square_size: number;
    hour_mark_diamond_width: number;
    hour_mark_diamond_height: number;
    show_minute_marks: boolean;
    minute_mark_length: number;
    minute_mark_width: number;
    minute_mark_style: MarkStyle;
    minute_mark_circle_diameter: number;
    minute_mark_square_size: number;
    minute_mark_diamond_width: number;
    minute_mark_diamond_height: number;
  };
  onChange: (params: Partial<MarksPanelProps["params"]>) => void;
  unitPreference: UnitPreference;
}

const StyleSelector: FC<{ label: string; value: MarkStyle; onChange: (v: MarkStyle) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-y-1 text-sm">
    <label className="text-gray-300">{label}</label>
    <div className="flex p-1 rounded-md bg-gray-700">
      {(["line", "circle"] as MarkStyle[]).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            value === s ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-600"
          }`}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

const MarksPanel: FC<MarksPanelProps> = ({ params, onChange, unitPreference }) => (
  <div className="p-4 flex flex-col gap-y-4">

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
          value={params.hour_mark_length}
          onChange={(v) => onChange({ hour_mark_length: v })}
          minMm={5} maxMm={30} stepMm={1}
          unit={unitPreference}
        />
        <UnitInputRange
          label="Hour Mark Width"
          value={params.hour_mark_width}
          onChange={(v) => onChange({ hour_mark_width: v })}
          minMm={1} maxMm={5} stepMm={0.5}
          unit={unitPreference}
        />
        <BooleanToggle
          label="Cardinal Marks Only"
          value={params.cardinal_marks_only}
          onChange={(v) => onChange({ cardinal_marks_only: v })}
        />
        <StyleSelector
          label="Hour Mark Style"
          value={params.hour_mark_style}
          onChange={(v) => onChange({ hour_mark_style: v })}
        />
        {params.hour_mark_style === "line" && (
          <BooleanToggle
            label="Rounded Ends"
            value={params.mark_round_ends}
            onChange={(v) => onChange({ mark_round_ends: v })}
          />
        )}
        {params.hour_mark_style === "circle" && (
          <InputRange label="Circle Diameter" value={params.hour_mark_circle_diameter}
            onChange={(v) => onChange({ hour_mark_circle_diameter: v })} min={1} max={20} step={0.5} />
        )}
        {params.hour_mark_style === "square" && (
          <InputRange label="Square Size" value={params.hour_mark_square_size}
            onChange={(v) => onChange({ hour_mark_square_size: v })} min={1} max={20} step={0.5} />
        )}
        {params.hour_mark_style === "diamond" && (<>
          <InputRange label="Diamond Width" value={params.hour_mark_diamond_width}
            onChange={(v) => onChange({ hour_mark_diamond_width: v })} min={1} max={20} step={0.5} />
          <InputRange label="Diamond Height" value={params.hour_mark_diamond_height}
            onChange={(v) => onChange({ hour_mark_diamond_height: v })} min={1} max={30} step={0.5} />
        </>)}
      </div>

      <div className="flex flex-col gap-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Minute Marks</h3>
        <BooleanToggle
          label="Show Minute Marks"
          value={params.show_minute_marks}
          onChange={(v) => onChange({ show_minute_marks: v })}
        />
        {params.show_minute_marks && (
          <>
            <StyleSelector
              label="Minute Mark Style"
              value={params.minute_mark_style}
              onChange={(v) => onChange({ minute_mark_style: v })}
            />
            {params.minute_mark_style === "line" && (<>
              <UnitInputRange label="Minute Mark Length" value={params.minute_mark_length}
                onChange={(v) => onChange({ minute_mark_length: v })} minMm={1} maxMm={15} stepMm={1} unit={unitPreference} />
              <UnitInputRange label="Minute Mark Width" value={params.minute_mark_width}
                onChange={(v) => onChange({ minute_mark_width: v })} minMm={0.5} maxMm={3} stepMm={0.5} unit={unitPreference} />
            </>)}
            {params.minute_mark_style === "circle" && (
              <InputRange label="Circle Diameter" value={params.minute_mark_circle_diameter}
                onChange={(v) => onChange({ minute_mark_circle_diameter: v })} min={1} max={15} step={0.5} />
            )}
            {params.minute_mark_style === "square" && (
              <InputRange label="Square Size" value={params.minute_mark_square_size}
                onChange={(v) => onChange({ minute_mark_square_size: v })} min={1} max={15} step={0.5} />
            )}
            {params.minute_mark_style === "diamond" && (<>
              <InputRange label="Diamond Width" value={params.minute_mark_diamond_width}
                onChange={(v) => onChange({ minute_mark_diamond_width: v })} min={1} max={15} step={0.5} />
              <InputRange label="Diamond Height" value={params.minute_mark_diamond_height}
                onChange={(v) => onChange({ minute_mark_diamond_height: v })} min={1} max={20} step={0.5} />
            </>)}
          </>
        )}
      </div>
  </div>
);

export default MarksPanel;
