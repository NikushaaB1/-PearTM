export type ColorThemeId = "hope" | "ocean" | "rose" | "forest" | "sunset" | "royal";

export type ColorTheme = {
    id: ColorThemeId;
    label: string;
    labelEn: string;
    accent: string;
    accentLight: string;
    sos: string;
    sosDeep: string;
    cream: string;
    creamWarm: string;
    swatch: string;
};

export const COLOR_THEMES: ColorTheme[] = [
    {
        id: "hope",
        label: "იმედი",
        labelEn: "Hope",
        accent: "#3A6B85",
        accentLight: "#558FA8",
        sos: "#C4564A",
        sosDeep: "#9A3D34",
        cream: "#F6F0E8",
        creamWarm: "#EDE5D8",
        swatch: "linear-gradient(135deg, #3A6B85 0%, #C49A5C 100%)",
    },
    {
        id: "ocean",
        label: "ოკეანე",
        labelEn: "Ocean",
        accent: "#3D5F94",
        accentLight: "#5A82BE",
        sos: "#C44B50",
        sosDeep: "#9A3238",
        cream: "#EEF2F8",
        creamWarm: "#E4EBF5",
        swatch: "linear-gradient(135deg, #3D5F94, #5A82BE)",
    },
    {
        id: "rose",
        label: "ვარდი",
        labelEn: "Rose",
        accent: "#9B4D6A",
        accentLight: "#C06B8A",
        sos: "#D4536F",
        sosDeep: "#A83250",
        cream: "#FAF0F4",
        creamWarm: "#F3E4EA",
        swatch: "linear-gradient(135deg, #9B4D6A, #D4536F)",
    },
    {
        id: "forest",
        label: "ტყე",
        labelEn: "Forest",
        accent: "#2D6A4F",
        accentLight: "#40916C",
        sos: "#C44B50",
        sosDeep: "#9A3238",
        cream: "#EDF5F0",
        creamWarm: "#E2EEE6",
        swatch: "linear-gradient(135deg, #2D6A4F, #40916C)",
    },
    {
        id: "sunset",
        label: "განთიადი",
        labelEn: "Sunset",
        accent: "#B85C28",
        accentLight: "#D47840",
        sos: "#D4533A",
        sosDeep: "#A83220",
        cream: "#FBF4EC",
        creamWarm: "#F5E8D8",
        swatch: "linear-gradient(135deg, #B85C28, #D4533A)",
    },
    {
        id: "royal",
        label: "სამეფო",
        labelEn: "Royal",
        accent: "#4A3B8F",
        accentLight: "#6B5BB5",
        sos: "#C44B50",
        sosDeep: "#9A3238",
        cream: "#F2EEF9",
        creamWarm: "#E9E3F4",
        swatch: "linear-gradient(135deg, #4A3B8F, #6B5BB5)",
    },
];

const THEME_CHOSEN_KEY = "colorThemeChosen";

export function applyColorTheme(id: ColorThemeId) {
    const theme = COLOR_THEMES.find(t => t.id === id) ?? COLOR_THEMES[0];
    const root = document.documentElement;
    root.dataset.colorTheme = id;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-light", theme.accentLight);
    root.style.setProperty("--accent-glow", `${theme.accent}2E`);
    root.style.setProperty("--sos", theme.sos);
    root.style.setProperty("--sos-deep", theme.sosDeep);
    root.style.setProperty("--sos-soft", `${theme.sos}18`);
    root.style.setProperty("--cream", theme.cream);
    root.style.setProperty("--cream-warm", theme.creamWarm);
    root.style.setProperty("--gold", id === "hope" ? "#C49A5C" : "#C4A05A");
    root.style.setProperty("--gold-soft", id === "hope" ? "rgba(196, 154, 92, 0.18)" : "rgba(196, 160, 90, 0.15)");
    root.style.setProperty("--grad-accent", `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentLight} 50%, ${theme.accentLight}CC 100%)`);
    root.style.setProperty("--grad-sos", `linear-gradient(135deg, ${theme.sos}EE 0%, ${theme.sos} 45%, ${theme.sosDeep} 100%)`);
    root.style.setProperty("--shadow-glow-accent", `0 8px 32px ${theme.accent}45`);
    root.style.setProperty("--shadow-glow-sos", `0 8px 32px ${theme.sos}55`);
    localStorage.setItem("colorTheme", id);
    localStorage.setItem(THEME_CHOSEN_KEY, "1");
}

export function getStoredColorTheme(): ColorThemeId {
    if (typeof window === "undefined") return "hope";
    if (!localStorage.getItem(THEME_CHOSEN_KEY)) {
        localStorage.setItem("colorTheme", "hope");
        return "hope";
    }
    const stored = localStorage.getItem("colorTheme") as ColorThemeId | null;
    return COLOR_THEMES.some(t => t.id === stored) ? stored! : "hope";
}
