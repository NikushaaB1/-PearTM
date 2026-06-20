import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { COLOR_THEMES } from "@/lib/color-themes";

export default function ThemePicker() {
    const { colorTheme, setColorTheme, lang } = useApp();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function close(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const current = COLOR_THEMES.find(t => t.id === colorTheme) ?? COLOR_THEMES[0];

    return (
        <div className="theme-picker" ref={ref}>
            <button
                type="button"
                className="theme-picker__btn"
                onClick={() => setOpen(o => !o)}
                title={lang === "ge" ? "ფერის თემა" : "Color theme"}
                aria-label={lang === "ge" ? "ფერის თემა" : "Color theme"}
            >
                <span className="theme-picker__swatch" style={{ background: current.swatch }} />
            </button>
            {open && (
                <div className="theme-picker__menu">
                    <p className="theme-picker__title">{lang === "ge" ? "ფერის თემა" : "Color theme"}</p>
                    <div className="theme-picker__grid">
                        {COLOR_THEMES.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                className={`theme-picker__opt${colorTheme === t.id ? " theme-picker__opt--on" : ""}`}
                                onClick={() => { setColorTheme(t.id); setOpen(false); }}
                                title={lang === "ge" ? t.label : t.labelEn}
                            >
                                <span style={{ background: t.swatch }} />
                                <span>{lang === "ge" ? t.label : t.labelEn}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
