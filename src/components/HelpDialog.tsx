import { type FC } from "react";
import Button from "./Button";

interface HelpDialogProps {
  onClose: () => void;
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="text-sm text-gray-300 flex flex-col gap-y-1.5">{children}</div>
  </div>
);

const Row: FC<{ label: string; desc: string }> = ({ label, desc }) => (
  <div className="flex gap-x-2">
    <span className="text-gray-200 font-medium shrink-0">{label}</span>
    <span className="text-gray-400">{desc}</span>
  </div>
);

export default function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <h2 className="text-base font-semibold text-gray-100">Clock Face Maker — Help</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
            aria-label="Close help"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">

          <Section title="Projects">
            <p>All work is organized into projects, saved automatically in your browser.</p>
            <Row label="New Project" desc="Click '+ New Project' in the left panel. Choose to start with default settings or copy the current project's settings." />
            <Row label="Switch" desc="Click any project in the list to switch to it. Unsaved changes are flushed before switching." />
            <Row label="Delete" desc="Click the trash icon on a project. This also removes all its snapshots." />
            <Row label="Auto-save" desc="Parameter changes are saved automatically after a short delay. Switching projects flushes any pending save immediately." />
          </Section>

          <Section title="Preview">
            <p>The center area shows a live SVG preview — updates instantly on every parameter change.</p>
            <Row label="Zoom" desc="Use the − / + buttons or the reset button (shows current %) to zoom the preview." />
            <Row label="Export SVG" desc="Downloads an SVG with the clock font either converted to outlines (when possible) or embedded as a web font." />
            <Row label="Export PNG" desc="Renders the SVG to a PNG at the face's natural pixel dimensions." />
          </Section>

          <Section title="Face panel">
            <Row label="Units" desc="Toggle between mm and inches. The exported SVG uses the chosen unit in its width/height attributes and sets inkscape:document-units so Inkscape opens the file in the correct unit." />
            <Row label="Shape" desc="Circle, Square, or Rounded Square. Rounded Square exposes a Corner Radius slider." />
            <Row label="Size" desc="Diameter for circles; Width and Height for squares (lock icon keeps them equal)." />
            <Row label="Face Color" desc="Background fill of the clock face." />
            <Row label="Border Color / Width" desc="Outer ring stroke. Set both to the face color to hide the border." />
            <Row label="Center Hole" desc="Diameter of the hole punched through the center of the face." />
            <Row label="Laser Mode" desc="Converts all fills to outlines, suitable for laser cutter paths." />
            <Row label="Crosshair" desc="Adds thin crosshair lines through the center for alignment." />
          </Section>

          <Section title="Marks panel">
            <Row label="Show Numbers" desc="Toggle 1–12 numerals on the face." />
            <Row label="Cardinal Numbers Only" desc="Show only 12, 3, 6, and 9." />
            <Row label="Mark Color" desc="Color applied to all hour marks, minute marks, and numbers." />
            <Row label="Border Gap" desc="Space between the marks and the outer border." />
            <Row label="Gap to Marks" desc="Space between the numbers and the hour marks." />
            <Row label="Hour Mark Style" desc="Line, Circle, Square, or Diamond. Line style exposes a Rounded Ends toggle." />
            <Row label="Hour Mark Length / Width" desc="Size of the hour tick marks." />
            <Row label="Cardinal Marks Only" desc="Show hour marks only at 12, 3, 6, and 9 positions." />
            <Row label="Show Minute Marks" desc="Toggle the 60-tick ring." />
            <Row label="Minute Mark Style" desc="Line, Circle, Square, or Diamond with corresponding size controls." />
          </Section>

          <Section title="Font panel">
            <Row label="Font" desc="Choose from hundreds of Google Fonts. The selected font becomes your default for new projects." />
            <Row label="Weight" desc="Font weight from Thin (100) to Black (900)." />
            <Row label="Italic" desc="Apply italic style to the numerals." />
            <Row label="Roman Numerals" desc="Display I–XII instead of 1–12." />
            <Row label="Size" desc="Numeral font size in pixels." />
            <p className="text-gray-500 text-xs mt-1">A live preview of the numeral style is shown at the bottom of the panel.</p>
          </Section>

          <Section title="Panels">
            <p>Each side panel (Projects, Face, Marks, Font) can be collapsed by clicking the arrow at the top of the panel. Click again to expand.</p>
          </Section>

        </div>

        <div className="px-6 py-4 border-t border-gray-700 shrink-0">
          <Button onClick={onClose} variant="secondary" className="w-full py-2">Close</Button>
        </div>
      </div>
    </div>
  );
}
