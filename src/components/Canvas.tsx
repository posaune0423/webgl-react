import { useEffect, useRef, useCallback } from "react";
import {
  createProgramInfo,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo,
  resizeCanvasToDisplaySize,
} from "twgl.js";
import vsSource from "@/libs/webgl/shaders/grid.vs";
import fsSource from "@/libs/webgl/shaders/grid.fs";
import { useGridState } from "@/hooks/useGridState";
import { BASE_CELL_SIZE, DEFAULT_BACKGROUND_COLOR, DEFAULT_GRID_COLOR, MAX_SCALE, MIN_SCALE } from "@/constants";
import { convertClientPosToCanvasPos } from "@/utils/canvas";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gridState, setGridState } = useGridState();

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      const { x, y } = convertClientPosToCanvasPos(canvasRef, e.clientX, e.clientY);

      if (e.ctrlKey) {
        // TrackPad pinch gesture
        const delta = -e.deltaY * 0.01;
        setGridState((prev) => {
          const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * (1 + delta)));
          const worldX = prev.offsetX + x / prev.scale;
          const worldY = prev.offsetY + y / prev.scale;
          const newOffsetX = Math.max(0, worldX - x / newScale);
          const newOffsetY = Math.max(0, worldY - y / newScale);
          return { ...prev, scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
        });
      } else {
        // Regular mouse wheel
        setGridState((prev) => ({
          ...prev,
          offsetX: Math.max(0, prev.offsetX + e.deltaX / prev.scale),
          offsetY: Math.max(0, prev.offsetY + e.deltaY / prev.scale),
        }));
      }
    },
    [setGridState]
  );

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    resizeCanvasToDisplaySize(canvas);

    const programInfo = createProgramInfo(gl, [vsSource, fsSource]);

    gl.clearColor(
      DEFAULT_BACKGROUND_COLOR.r,
      DEFAULT_BACKGROUND_COLOR.g,
      DEFAULT_BACKGROUND_COLOR.b,
      DEFAULT_BACKGROUND_COLOR.a
    );
    gl.clear(gl.COLOR_BUFFER_BIT);

    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;
    const visibleWidth = canvasWidth / gridState.scale;
    const visibleHeight = canvasHeight / gridState.scale;
    const startX = Math.floor(gridState.offsetX / BASE_CELL_SIZE) * BASE_CELL_SIZE;
    const startY = Math.floor(gridState.offsetY / BASE_CELL_SIZE) * BASE_CELL_SIZE;
    const endX = startX + visibleWidth + BASE_CELL_SIZE;
    const endY = startY + visibleHeight + BASE_CELL_SIZE;
    const BUFFER_RATIO = 1.5;
    const darker = gridState.scale > MIN_SCALE * BUFFER_RATIO ? 1.0 : 0.5;
    const baseLineWidth = 1.0;

    const positions: number[] = [];

    for (let x = startX; x <= endX; x += BASE_CELL_SIZE) {
      positions.push(x, startY, x, endY);
    }

    for (let y = startY; y <= endY; y += BASE_CELL_SIZE) {
      positions.push(startX, y, endX, y);
    }

    const uniforms = {
      uResolution: [gl.canvas.width, gl.canvas.height],
      uOffset: [gridState.offsetX, gridState.offsetY],
      uScale: gridState.scale,
      uLineWidth: baseLineWidth * gridState.scale,
      uColor: [
        DEFAULT_GRID_COLOR.r * darker,
        DEFAULT_GRID_COLOR.g * darker,
        DEFAULT_GRID_COLOR.b * darker,
        DEFAULT_GRID_COLOR.a,
      ],
    };

    const bufferInfo = createBufferInfoFromArrays(gl, {
      aPosition: { numComponents: 2, data: positions },
    });

    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, bufferInfo, gl.LINES, positions.length / 2);
  }, [gridState]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} onWheel={handleWheel} />;
};
