import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {RoundedBox, Text} from '@react-three/drei';

// 3D test: a phone floats and turns towards the camera while chat bubbles stack on its screen.
export type Phone3DProps = {messages: {from: 'me' | 'them'; text: string}[]; hook: string};
export const Phone3D: React.FC<Phone3DProps> = ({messages, hook}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / 30;
  const turn = interpolate(t, [0, 1.2], [-0.9, -0.18], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const bob = Math.sin(t * 1.6) * 0.05;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(70% 50% at 50% 45%, #2b1d4a, #07080f 75%)'}}>
      <ThreeCanvas linear width={width} height={height} camera={{fov: 35, position: [0, 0, 12.5]}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <pointLight position={[-4, -2, 3]} intensity={30} color="#ff4fa3" />
        <group rotation={[0.12 + bob, turn, 0.04]} position={[0, -0.9 + bob, 0]}>
          <RoundedBox args={[2.6, 5.4, 0.28]} radius={0.32} smoothness={6}>
            <meshStandardMaterial color="#111318" metalness={0.7} roughness={0.25} />
          </RoundedBox>
          <mesh position={[0, 0, 0.145]}>
            <planeGeometry args={[2.36, 5.1]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {messages.map((m, i) => {
            const at = 0.8 + i * 0.9;
            const k = interpolate(t, [at, at + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
            const me = m.from === 'me';
            const y = 1.9 - i * 0.78;
            return (
              <group key={i} position={[me ? 0.32 : -0.32, y, 0.16 + k * 0.04]} scale={[k, k, k]}>
                <RoundedBox args={[1.55, 0.6, 0.04]} radius={0.18} smoothness={4}>
                  <meshStandardMaterial color={me ? '#0b84fe' : '#e9e9eb'} />
                </RoundedBox>
                <Text position={[0, 0, 0.03]} fontSize={0.15} maxWidth={1.4} color={me ? '#ffffff' : '#111111'} anchorX="center" anchorY="middle">{m.text}</Text>
              </group>
            );
          })}
        </group>
      </ThreeCanvas>
      <div style={{position: 'absolute', top: 150, left: 60, right: 60, textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 70, color: '#fff', lineHeight: 1.1}}>{hook}</div>
    </AbsoluteFill>
  );
};
