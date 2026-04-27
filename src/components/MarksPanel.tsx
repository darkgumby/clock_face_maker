import { type FC } from "react";
import { UnitPreference } from "../hooks/useSettings";
import { BooleanToggle, ColorInput, UnitInputRange } from "./PanelControls";

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
    show_minute_marks: boolean;
    minute_mark_length: number;
    minute_mark_width: number;
  };
  onChange: (params: Partial<MarksPanelProps["params"]>) => void;
  unitPreference: UnitPreference;
}

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
            <UnitInputRange
              label="Minute Mark Length"
              value={params.minute_mark_length}
              onChange={(v) => onChange({ minute_mark_length: v })}
              minMm={1} maxMm={15} stepMm={1}
              unit={unitPreference}
            />
            <UnitInputRange
              label="Minute Mark Width"
              value={params.minute_mark_width}
              onChange={(v) => onChange({ minute_mark_width: v })}
              minMm={0.5} maxMm={3} stepMm={0.5}
              unit={unitPreference}
            />
          </>
        )}
      </div>
  </div>
);

export default MarksPanel;
