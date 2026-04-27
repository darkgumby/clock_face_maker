import { useState, useEffect, useRef, useMemo } from "react";

// Popular Google Fonts across categories — extend freely
export const GOOGLE_FONTS: string[] = [
  // Sans-serif
  "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Cabin", "Chivo",
  "DM Sans", "Encode Sans", "Encode Sans Condensed", "Exo", "Exo 2",
  "Figtree", "Fjalla One", "Geologica", "Hanken Grotesk", "Heebo",
  "IBM Plex Sans", "IBM Plex Sans Condensed", "Inter", "Jost", "Josefin Sans",
  "Kanit", "Karla", "Lato", "Lexend", "Libre Franklin",
  "Manrope", "Monda", "Montserrat", "Montserrat Alternates", "Mulish",
  "Noto Sans", "Nunito", "Nunito Sans", "Open Sans", "Orbitron",
  "Oswald", "Outfit", "Overpass", "Oxanium", "Plus Jakarta Sans",
  "Poppins", "PT Sans", "PT Sans Caption", "PT Sans Narrow", "Quantico",
  "Quicksand", "Raleway", "Red Hat Display", "Roboto", "Roboto Condensed",
  "Roboto Flex", "Rubik", "Saira", "Saira Condensed", "Schibsted Grotesk",
  "Source Sans 3", "Space Grotesk", "Titillium Web", "Ubuntu", "Ubuntu Condensed",
  "Unbounded", "Urbanist", "Work Sans", "Yantramanav",
  // Serif
  "Alegreya", "Alegreya SC", "Arvo", "Bitter", "Brygada 1918",
  "Cormorant", "Cormorant Garamond", "Cormorant SC", "Crimson Pro", "Crimson Text",
  "DM Serif Display", "DM Serif Text", "EB Garamond", "Frank Ruhl Libre", "Fraunces",
  "Gloock", "Libre Baskerville", "Lora", "Merriweather", "Neuton",
  "Noto Serif", "Old Standard TT", "Playfair Display", "Playfair Display SC", "PT Serif",
  "Roboto Slab", "Rokkitt", "Rufina", "Slabo 27px", "Source Serif 4",
  "Spectral", "Unna", "Vollkorn", "Zilla Slab",
  // Display / decorative
  "Abril Fatface", "Alfa Slab One", "Anton", "Audiowide", "Bebas Neue",
  "Big Shoulders Display", "Big Shoulders Text", "Black Han Sans", "Black Ops One",
  "Boogaloo", "Chakra Petch", "Cinzel", "Cinzel Decorative", "Comfortaa",
  "Dancing Script", "Faster One", "Graduate", "Gruppo",
  "Italiana", "Kaushan Script", "Lobster", "Lobster Two", "Londrina Solid",
  "Monoton", "Nixie One", "Nova Mono", "Pacifico", "Permanent Marker",
  "Philosopher", "Play", "Poiret One", "Prosto One", "Rajdhani",
  "Righteous", "Russo One", "Share Tech Mono", "Signika", "Squada One",
  "Teko", "Tenor Sans", "Tinos", "Unica One", "Wallpoet",
  "Yanone Kaffeesatz", "Yeseva One", "Zeyada",
  // Monospace
  "Anonymous Pro", "Cousine", "IBM Plex Mono", "Inconsolata", "Roboto Mono",
  "Source Code Pro", "Space Mono", "Ubuntu Mono", "VT323",
].sort();

// Track which font families have already been injected as <link> elements
const _loaded = new Set<string>();

function loadGoogleFonts(names: string[]) {
  const toLoad = names.filter((n) => !_loaded.has(n));
  if (toLoad.length === 0) return;
  toLoad.forEach((n) => _loaded.add(n));
  const families = toLoad
    .map((n) => `family=${encodeURIComponent(n)}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900`)
    .join("&");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  // Add any other props here if they become necessary
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [query]);

  // Load the selected font for the trigger preview
  useEffect(() => { loadGoogleFonts([value]); }, [value]);

  useEffect(() => {
    if (open) loadGoogleFonts(filtered);
  }, [open, filtered]);

  useEffect(() => {
    if (open) selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const select = (font: string) => {
    onChange(font);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
    if (e.key === "Enter" && filtered.length > 0) select(filtered[0]);
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full flex items-center justify-between text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500 hover:border-gray-500"
      >
        <span style={{ fontFamily: `"${value}", sans-serif` }}>{value}</span>
        <svg className="w-3 h-3 text-gray-400 shrink-0 ml-1" viewBox="0 0 10 6" fill="currentColor">
          <path d="M0 0l5 6 5-6z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-2xl">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search fonts…"
            className="w-full px-2 py-1.5 text-xs bg-gray-700 text-gray-200 placeholder-gray-500 border-b border-gray-600 focus:outline-none rounded-t"
          />
          <div className="max-h-96 overflow-y-auto">
            {filtered.map((font) => (
              <div
                key={font}
                ref={font === value ? selectedRef : null}
                onMouseDown={() => select(font)}
                className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-700 transition-colors ${
                  font === value ? "text-blue-400 bg-gray-700" : "text-gray-200"
                }`}
                style={{ fontFamily: `"${font}", sans-serif` }}
              >
                {font}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-xs text-gray-500">No fonts found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
