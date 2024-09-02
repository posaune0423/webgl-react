export interface Pixel {
  x: number;
  y: number;
  color: Color;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GridState {
  offsetX: number;
  offsetY: number;
  scale: number;
  lastPinchDist?: number;
}
