import { type FC } from "react";
import { UnitPreference } from "../hooks/useSettings";

export const MM_PER_INCH = 25.4;

export function toFractionInches(inches: number): string {
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

export const UnitInputRange: FC<{
  label: string;
  value: number;
  onChange: (valueInMm: number) => void;
  minMm: number;
  maxMm: number;
  stepMm: number;
  unit: UnitPreference;
}> = ({ label, value, onChange, minMm, maxMm, stepMm, unit }) => {
  const inches = value / MM_PER_INCH;
  const sliderMin = unit === "in" ? minMm / MM_PER_INCH : minMm;
  const sliderMax = unit === "in" ? maxMm / MM_PER_INCH : maxMm;
  const sliderStep = unit === "in" ? stepMm / MM_PER_INCH : stepMm;
  const sliderValue = unit === "in" ? inches : value;
  const displayValue = unit === "in" ? toFractionInches(inches) : `${value.toFixed(1)}`;

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
          onChange={(e) => onChange(unit === "in" ? parseFloat(e.target.value) * MM_PER_INCH : parseFloat(e.target.value))}
          className="flex-1 h-1.5 appearance-none bg-gray-600 rounded-lg cursor-pointer"
        />
        <span className="text-gray-400 w-16 text-right text-xs">{displayValue}</span>
      </div>
    </div>
  );
};

export const InputRange: FC<{
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

export const ColorInput: FC<{
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

export const BooleanToggle: FC<{
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
