import React from 'react';
export const Canvas = ({ children, ...rest }) => (
  <div data-testid="canvas" {...rest}>{children}</div>
);
export const useFrame = () => {};
export default { Canvas, useFrame };
