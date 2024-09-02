import { useEffect, useRef } from "react";
import {
  createProgramInfo,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo,
  resizeCanvasToDisplaySize,
} from "twgl.js";
import vsSource from "@/libs/webgl/shaders/main.vs";
import fsSource from "@/libs/webgl/shaders/main.fs";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const programInfo = createProgramInfo(gl, [vsSource, fsSource]);

    const arrays = {
      position: [-1, -1, 0, 1, -1, 0, 0, 1, 0],
    };
    const bufferInfo = createBufferInfoFromArrays(gl, arrays);

    function render(time: number) {
      if (!gl) return;
      resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      const uniforms = {
        color: [Math.sin(time * 0.001) * 0.5 + 0.5, Math.cos(time * 0.001) * 0.5 + 0.5, 0, 1],
      };

      gl.useProgram(programInfo.program);
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
      setUniforms(programInfo, uniforms);
      drawBufferInfo(gl, bufferInfo);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} />;
};
