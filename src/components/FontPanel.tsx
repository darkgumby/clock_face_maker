import { type FC } from "react";
import FontPicker from "./FontPicker";

const WEIGHTS: [number, string][] = [
  [100, "100 Thin"], [200, "200 ExtraLight"], [300, "300 Light"],
  [400, "400 Regular"], [500, "500 Medium"], [600, "600 SemiBold"],
  [700, "700 Bold"], [800, "800 ExtraBold"], [900, "900 Black"],
];

interface FontPanelParams {
  number_font: string;
  number_size: number;
  number_font_weight: number;
  number_font_italic: boolean;
number_roman: boolean;
  show_numbers: boolean;
}

interface FontPanelProps {
  params: FontPanelParams;
  onChange: (partial: Partial<FontPanelParams>) => void;
  defaultFont: string;
  onSetDefaultFont: (font: string) => void;
}

const Toggle: FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between text-sm">
    <label className="text-gray-300">{label}</label>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-blue-500" : "bg-gray-600"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

const Slider: FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display?: string }> = ({
  label, value, min, max, step, onChange, display
}) => (
  <div className="flex flex-col gap-y-1 text-sm">
    <label className="text-gray-300">{label}</label>
    <div className="flex items-center gap-x-2">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 appearance-none bg-gray-600 rounded-lg cursor-pointer"
      />
      <span className="text-gray-400 w-10 text-right text-xs">{display ?? value}</span>
    </div>
  </div>
);

export default function FontPanel({ params, onChange, onSetDefaultFont }: FontPanelProps) {
  const handleFontChange = (font: string) => {
    onChange({ number_font: font });
    onSetDefaultFont(font);
  };

  const previewLabel = params.number_roman ? "XII" : "12";

  return (
    <div className="p-4 flex flex-col gap-y-4">

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font</h3>

        <FontPicker value={params.number_font} onChange={handleFontChange} />

        <div className="flex flex-col gap-y-1 text-sm">
          <label className="text-gray-300">Weight</label>
          <select
            value={params.number_font_weight}
            onChange={(e) => onChange({ number_font_weight: parseInt(e.target.value) })}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-blue-500"
          >
            {WEIGHTS.map(([w, label]) => (
              <option key={w} value={w}>{label}</option>
            ))}
          </select>
        </div>

        <Toggle label="Italic" value={params.number_font_italic} onChange={(v) => onChange({ number_font_italic: v })} />
<Toggle label="Roman Numerals" value={params.number_roman} onChange={(v) => onChange({ number_roman: v })} />

        <Slider label="Size" value={params.number_size} min={8} max={40} step={1} onChange={(v) => onChange({ number_size: v })} />

        <div className="mt-2 p-3 bg-gray-700 rounded text-center" style={{
          fontFamily: `"${params.number_font}", sans-serif`,
          fontWeight: params.number_font_weight,
          fontStyle: params.number_font_italic ? "italic" : "normal",
fontSize: `${Math.max(16, Math.min(params.number_size * 1.5, 48))}px`,
          color: "#e5e7eb",
        }}>
          {previewLabel}
        </div>

    </div>
  );
}
