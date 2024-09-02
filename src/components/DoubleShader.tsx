import { useEffect, useRef } from "react";
import {
  resizeCanvasToDisplaySize,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo,
  createProgramInfo,
  createBufferInfoFromArrays,
} from "twgl.js";
import fsSourceTriangle from "@/libs/webgl/shaders/triangle.fs";
import fsSourceSquare from "@/libs/webgl/shaders/square.fs";
import vsSource from "@/libs/webgl/shaders/shapes.vs";

export const DoubleShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const programInfoTriangle = createProgramInfo(gl, [vsSource, fsSourceTriangle]);
    const programInfoSquare = createProgramInfo(gl, [vsSource, fsSourceSquare]);

    const triangleBufferInfo = createBufferInfoFromArrays(gl, {
      a_position: { numComponents: 2, data: [0, 0, 100, 0, 50, 100] },
    });

    const squareBufferInfo = createBufferInfoFromArrays(gl, {
      a_position: { numComponents: 2, data: [150, 0, 250, 0, 150, 100, 250, 100] },
    });

    function render() {
      if (!gl) return;
      resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Draw Triangle
      gl.useProgram(programInfoTriangle.program);
      setBuffersAndAttributes(gl, programInfoTriangle, triangleBufferInfo);
      setUniforms(programInfoTriangle, { u_resolution: [gl.canvas.width, gl.canvas.height] });
      drawBufferInfo(gl, triangleBufferInfo);

      // Draw Square
      gl.useProgram(programInfoSquare.program);
      setBuffersAndAttributes(gl, programInfoSquare, squareBufferInfo);
      setUniforms(programInfoSquare, { u_resolution: [gl.canvas.width, gl.canvas.height] });
      drawBufferInfo(gl, squareBufferInfo);
    }

    render();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-x-0 bottom top-[50px] h-[calc(100%-50px)] w-full" />;
};
