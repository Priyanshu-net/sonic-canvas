import React from 'react';
export const Canvas = ({ children, ...rest }) => (
  React.createElement('div', { 'data-testid': 'canvas', ...rest }, children)
);
export const useFrame = () => {};
export const useThree = () => ({ camera: { position: { x: 0, y: 0, z: 0 } } });
export default { Canvas, useFrame, useThree };
