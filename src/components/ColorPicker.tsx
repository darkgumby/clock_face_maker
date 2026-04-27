import { type FC } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
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
};

export default ColorPicker;
