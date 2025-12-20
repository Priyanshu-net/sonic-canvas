import React from 'react';
export const Physics = ({ children }) => <>{children}</>;
export const usePlane = () => [ { current: { position: { x:0, y:-5, z:0 } } } ];
export const useSphere = () => [ { current: { position: { x:0, y:0, z:0 } } } ];
export default { Physics, usePlane, useSphere };
