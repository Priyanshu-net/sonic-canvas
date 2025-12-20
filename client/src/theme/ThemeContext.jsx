import React, { createContext, useContext, useMemo, useState } from 'react';

// Simple hex color lerp between two hex strings (e.g. #000000 and #ffffff)
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function rgbToHex({ r, g, b }) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpHex(aHex, bHex, t) {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bC = Math.round(lerp(a.b, b.b, t));
  return rgbToHex({ r, g, b: bC });
}

function rgbaStr(rgb, a) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

function makeThemeTokens(shade) {
  // shade: 0 (dark) -> 1 (light)
  const bgDark = '#050505';
  const bgLight = '#f5f7fb';
  const textDark = '#ffffff';
  const textLight = '#0f172a'; // slate-900-ish

  const bg = lerpHex(bgDark, bgLight, shade);
  const text = lerpHex(textDark, textLight, shade);

  // Panels: switch from glassy white overlay on dark to subtle dark overlay on light
  // We'll blend alpha to keep nice translucency in both modes
  const panelLightBase = { r: 0, g: 0, b: 0 };
  const panelDarkBase = { r: 255, g: 255, b: 255 };
  const panelBg = shade < 0.5
    ? rgbaStr(panelDarkBase, lerp(0.08, 0.04, shade / 0.5)) // more visible on dark
    : rgbaStr(panelLightBase, lerp(0.06, 0.04, (shade - 0.5) / 0.5));

  const panelBorder = shade < 0.5
    ? rgbaStr(panelDarkBase, lerp(0.2, 0.12, shade / 0.5))
    : rgbaStr(panelLightBase, lerp(0.14, 0.12, (shade - 0.5) / 0.5));

  const mutedText = shade < 0.5
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(15,23,42,0.65)';

  // 3D scene related
  // Make 3D background slightly darker than page on light shades for depth
  const bg3d = lerpHex(bg, '#0a0a0a', 0.15 + 0.25 * shade);
  const gridStrong = lerpHex('#333344', '#ccd5e0', shade);
  const gridWeak = lerpHex('#222233', '#e5ecf4', shade);
  const floor = lerpHex('#1a1a2e', '#e8eefc', shade);
  const floorOpacity = lerp(0.10, 0.18, shade); // a bit stronger on light bg for contrast

  return {
    shade,
    colors: {
      bg,
      text,
      mutedText,
      panelBg,
      panelBorder,
      bg3d,
      gridStrong,
      gridWeak,
      floor,
      floorOpacity,
  // UI ripple/overlay guidance
  rippleAlpha: lerp(0.85, 0.55, shade),
      // statuses
      success: '#4ade80',
      danger: '#ef4444',
      accentA: '#00ffff',
      accentB: '#ff00ff',
    }
  };
}

const defaultTheme = makeThemeTokens(0.15);

const ThemeContext = createContext({
  theme: defaultTheme,
  setShade: () => {},
});

export function ThemeProvider({ initialShade = 0.15, children }) {
  const [shade, setShade] = useState(initialShade);
  const theme = useMemo(() => makeThemeTokens(shade), [shade]);
  return (
    <ThemeContext.Provider value={{ theme, setShade }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
