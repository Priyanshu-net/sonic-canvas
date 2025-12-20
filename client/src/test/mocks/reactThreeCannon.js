import React from 'react';
export let lastPhysicsProps = null;
export const Physics = ({ children, ...props }) => {
	lastPhysicsProps = props;
	return React.createElement(React.Fragment, null, children);
};
export const usePlane = () => [ { current: { position: { x:0, y:-5, z:0 } } } ];
export const useSphere = () => [
	{ current: { position: { x:0, y:0, z:0 } } },
	{
		velocity: { set: () => {} },
		angularVelocity: { set: () => {} },
		applyImpulse: () => {}
	}
];
export default { Physics, usePlane, useSphere, lastPhysicsProps };
