export const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

export const valueToCoordinate = (value: number, max: number, radius: number, angle: number, cx: number, cy: number) => {
  const r = (value / max) * radius;
  return polarToCartesian(cx, cy, r, angle);
};

