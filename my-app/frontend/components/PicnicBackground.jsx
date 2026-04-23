import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

export default function PicnicBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        {/* Base yellow */}
        <Rect width="100%" height="100%" fill="#FFD5D6" />
        {/* Horizontal stripes */}
        {Array.from({ length: 40 }).map((_, i) => (
          <Rect
            key={`h${i}`}
            x="0" y={i * 40}
            width="100%" height="20"
            fill="rgba(255, 255, 255, 0.21)"
          />
        ))}
        {/* Vertical stripes */}
        {Array.from({ length: 30 }).map((_, i) => (
          <Rect
            key={`v${i}`}
            x={i * 40} y="0"
            width="20" height="100%"
            fill="hsla(0, 0.00%, 94.10%, 0.54)"
          />
        ))}
      </Svg>
    </View>
  );
}