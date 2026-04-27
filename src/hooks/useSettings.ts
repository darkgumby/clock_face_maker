import { useState } from "react";
import { loadSettings, saveSettings } from "../lib/storage";

export type UnitPreference = "mm" | "in";

export function useSettings() {
  const stored = loadSettings();
  const [defaultFont, setDefaultFontState] = useState<string>(stored.defaultFont);
  const [lastSelectedProjectId, setLastSelectedProjectIdState] = useState<string | null>(stored.lastSelectedProjectId);

  const setDefaultFont = async (font: string) => {
    saveSettings({ defaultFont: font });
    setDefaultFontState(font);
  };

  const setLastSelectedProjectId = async (projectId: string | null) => {
    saveSettings({ lastSelectedProjectId: projectId });
    setLastSelectedProjectIdState(projectId);
  };

  return {
    defaultFont,
    setDefaultFont,
    lastSelectedProjectId,
    setLastSelectedProjectId,
    loading: false,
    error: null,
  };
}
