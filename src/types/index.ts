export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GridDimensions {
  width: number;
  height: number;
}

export interface GridState {
  offsetX: number;
  offsetY: number;
  scale: number;
  lastPinchDist?: number;
}
