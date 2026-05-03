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

const FONT_WEIGHTS = "ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900";

const _fontReady = new Map<string, Promise<void>>();

function getFontReadyPromise(font: string): Promise<void> {
  if (!_fontReady.has(font)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:${FONT_WEIGHTS}&display=swap`;
    const p = new Promise<void>((res) => {
      link.onload = () => res();
      link.onerror = () => res();
      document.head.appendChild(link);
    });
    _fontReady.set(font, p);
  }
  return _fontReady.get(font)!;
}

const _batchSeen = new Set<string>();

function loadGoogleFonts(names: string[]): void {
  const toLoad = names.filter((n) => !_batchSeen.has(n) && !_fontReady.has(n));
  if (toLoad.length === 0) return;
  toLoad.forEach((n) => _batchSeen.add(n));
  const CHUNK = 20;
  for (let i = 0; i < toLoad.length; i += CHUNK) {
    const families = toLoad.slice(i, i + CHUNK)
      .map((n) => `family=${encodeURIComponent(n)}:${FONT_WEIGHTS}`)
      .join("&");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  }
}

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return GOOGLE_FONTS;
    const q = query.toLowerCase();
    return GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [query]);

  // Batch-preload fonts visible in filtered list
  useEffect(() => { loadGoogleFonts(filtered); }, [filtered]);

  // Scroll selected item into view when value changes or filter resets
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [value, query]);

  const select = (font: string) => {
    onChange(font);
    // Kick off per-font CSS load; SvgPreview listens for loadingdone and
    // remounts to repaint once the font file actually arrives.
    getFontReadyPromise(font);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const idx = filtered.indexOf(value);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (idx < filtered.length - 1) select(filtered[idx + 1]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx > 0) select(filtered[idx - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-y-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search fonts…"
        className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 placeholder-gray-500 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
      />
      <div
        ref={listRef}
        className="overflow-y-auto rounded border border-gray-600 bg-gray-800"
        style={{ height: "440px" }}
      >
        {filtered.map((font) => (
          <div
            key={font}
            ref={font === value ? selectedRef : null}
            onClick={() => select(font)}
            className={`px-2 py-2 text-lg cursor-pointer select-none transition-colors ${
              font === value
                ? "bg-blue-600 text-white"
                : "text-gray-200 hover:bg-gray-700"
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
  );
}
