import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export const FileBadge = ({ name, position = 'bottom-right' }) => {
  const { theme } = useTheme();
  const base = {
    position: 'absolute',
    fontSize: '10px',
    letterSpacing: '0.04em',
    padding: '2px 6px',
    borderRadius: '6px',
    background: theme.colors.panelBg,
    border: `1px solid ${theme.colors.panelBorder}`,
    color: theme.colors.mutedText,
    pointerEvents: 'none',
    zIndex: 100
  };
  const pos = (() => {
    switch (position) {
      case 'top-left': return { top: '-10px', left: '8px' };
      case 'top-right': return { top: '-10px', right: '8px' };
      case 'bottom-left': return { bottom: '-10px', left: '8px' };
      default: return { bottom: '-10px', right: '8px' };
    }
  })();
  return (
    <div aria-hidden style={{ ...base, ...pos }}>{name}</div>
  );
};
