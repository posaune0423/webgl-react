import { useEffect, useRef, useCallback, useState } from "react";
import {
  createProgramInfo,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo,
  resizeCanvasToDisplaySize,
  ProgramInfo,
} from "twgl.js";

import gridVsSource from "@/libs/webgl/shaders/grid.vs";
import gridFsSource from "@/libs/webgl/shaders/grid.fs";
import pixelVsSource from "@/libs/webgl/shaders/pixel.vs";
import pixelFsSource from "@/libs/webgl/shaders/pixel.fs";

import { useGridState } from "@/hooks/useGridState";
import { BASE_CELL_SIZE, BASE_LINE_WIDTH, BUFFER_RATIO, DEFAULT_GRID_COLOR, MAX_SCALE, MIN_SCALE } from "@/constants";
import { convertClientPosToCanvasPos } from "@/utils/canvas";
import { Pixel } from "@/types";
import { fetchRandomPixelData } from "@/libs/mockApi";

export const PixelGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gridState, setGridState } = useGridState();
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const gridProgramInfoRef = useRef<ProgramInfo | null>(null);
  const pixelProgramInfoRef = useRef<ProgramInfo | null>(null);
  const [pixels, setPixels] = useState<Pixel[]>([]);

  const getVisibleArea = useCallback(() => {
    const gl = glRef.current;
    if (!gl) {
      return { startX: 0, startY: 0, endX: 1000, endY: 1000 };
    }

    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;
    const visibleWidth = canvasWidth / gridState.scale;
    const visibleHeight = canvasHeight / gridState.scale;
    const startX = Math.floor(gridState.offsetX / BASE_CELL_SIZE) * BASE_CELL_SIZE;
    const startY = Math.floor(gridState.offsetY / BASE_CELL_SIZE) * BASE_CELL_SIZE;
    const endX = startX + visibleWidth + BASE_CELL_SIZE;
    const endY = startY + visibleHeight + BASE_CELL_SIZE;

    return { startX, startY, endX, endY };
  }, [gridState]);

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
    const gl = glRef.current;
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    const gridProgramInfo = gridProgramInfoRef.current;
    const pixelProgramInfo = pixelProgramInfoRef.current;
    if (!gridProgramInfo || !pixelProgramInfo) {
      console.error("ProgramInfo not initialized");
      return;
    }

    const { startX, startY, endX, endY } = getVisibleArea();
    const darker = gridState.scale > MIN_SCALE * BUFFER_RATIO ? 1.0 : 0.5;

    // グリッドの描画
    const gridPositions: number[] = [];
    for (let x = startX; x <= endX; x += BASE_CELL_SIZE) {
      gridPositions.push(x, startY, x, endY);
    }
    for (let y = startY; y <= endY; y += BASE_CELL_SIZE) {
      gridPositions.push(startX, y, endX, y);
    }

    const gridUniforms = {
      uResolution: [gl.canvas.width, gl.canvas.height],
      uOffset: [gridState.offsetX, gridState.offsetY],
      uScale: gridState.scale,
      uLineWidth: BASE_LINE_WIDTH * gridState.scale,
      uColor: [
        DEFAULT_GRID_COLOR.r * darker,
        DEFAULT_GRID_COLOR.g * darker,
        DEFAULT_GRID_COLOR.b * darker,
        DEFAULT_GRID_COLOR.a,
      ],
    };

    const gridBufferInfo = createBufferInfoFromArrays(gl, {
      aPosition: { numComponents: 2, data: gridPositions },
    });

    gl.useProgram(gridProgramInfo.program);
    setBuffersAndAttributes(gl, gridProgramInfo, gridBufferInfo);
    setUniforms(gridProgramInfo, gridUniforms);
    drawBufferInfo(gl, gridBufferInfo, gl.LINES, gridPositions.length / 2);
  }, [getVisibleArea, gridState]);

  const drawPixels = useCallback(async () => {
    const gl = glRef.current;
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    const pixelProgramInfo = pixelProgramInfoRef.current;
    if (!pixelProgramInfo) {
      console.error("ProgramInfo not initialized");
      return;
    }

    // ピクセルの描画
    const pixelPositions: number[] = [];
    const pixelColors: number[] = [];

    pixels.forEach((pixel) => {
      const x = pixel.x * BASE_CELL_SIZE;
      const y = pixel.y * BASE_CELL_SIZE;

      const positions = [x, y, x + BASE_CELL_SIZE, y, x, y + BASE_CELL_SIZE, x + BASE_CELL_SIZE, y + BASE_CELL_SIZE];
      pixelPositions.push(...positions);
      for (let i = 0; i < 4; i++) {
        pixelColors.push(pixel.color.r, pixel.color.g, pixel.color.b, pixel.color.a);
      }
    });

    const pixelBufferInfo = createBufferInfoFromArrays(gl, {
      aPosition: { numComponents: 2, data: pixelPositions },
      aColor: { numComponents: 4, data: pixelColors },
    });

    const pixelUniforms = {
      uResolution: [gl.canvas.width, gl.canvas.height],
      uOffset: [gridState.offsetX, gridState.offsetY],
      uScale: gridState.scale,
    };

    gl.useProgram(pixelProgramInfo.program);
    setBuffersAndAttributes(gl, pixelProgramInfo, pixelBufferInfo);
    setUniforms(pixelProgramInfo, pixelUniforms);
    drawBufferInfo(gl, pixelBufferInfo, gl.TRIANGLE_STRIP, pixelPositions.length / 2);
  }, [gridState, pixels]);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    resizeCanvasToDisplaySize(canvas);
    gridProgramInfoRef.current = createProgramInfo(gl, [gridVsSource, gridFsSource]);
    pixelProgramInfoRef.current = createProgramInfo(gl, [pixelVsSource, pixelFsSource]);
  }, []);

  useEffect(() => {
    initWebGL();
  }, [initWebGL]);

  useEffect(() => {
    drawGrid();
    drawPixels();
  }, [drawGrid, drawPixels]);

  useEffect(() => {
    const fetchPixels = async () => {
      console.log("fetchPixels");
      const fetchedPixels = await fetchRandomPixelData();
      if (fetchedPixels.length !== pixels.length) {
        setPixels(fetchedPixels);
      }
    };
    fetchPixels();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full fixed inset-0 h-[calc(100%-50px)] top-[50px] bg-black/80"
      onWheel={handleWheel}
    />
  );
};
