import React, { useEffect, useRef } from "react";

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas as HTMLCanvasElement;

    const gl = canvasEl.getContext("webgl");
    if (!gl) return;

    const vertexSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = position * 0.5 + 0.5;
            v_texCoord.y = 1.0 - v_texCoord.y;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_darkTheme;
        varying vec2 v_texCoord;

        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        void main() {
            vec2 uv = v_texCoord;
            vec2 st = uv * 2.0 - 1.0;
            st.x *= u_resolution.x / u_resolution.y;

            vec3 baseColor = mix(vec3(0.97, 0.97, 0.98), vec3(0.04, 0.07, 0.15), u_darkTheme);
            vec3 color = baseColor;
            
            // Create a 3D-like particle grid
            float scale = 15.0;
            vec2 grid_uv = uv * scale;
            vec2 id = floor(grid_uv);
            vec2 g_uv = fract(grid_uv) - 0.5;
            
            float h = hash(id);
            
            // Particle movement
            float size = 0.1 * h;
            float dist = length(g_uv);
            
            // Pulsing and waving
            float pulse = sin(u_time * 0.5 + h * 6.28) * 0.5 + 0.5;
            float wave = sin(uv.x * 5.0 + u_time + h) * 0.2;
            
            float m = smoothstep(size, size - 0.05, dist + wave * 0.1);
            
            // Color glow
            vec3 pColor = mix(
              mix(vec3(0.4, 0.35, 0.9), vec3(0.2, 0.7, 0.9), h), // light mode particles (higher visibility contrast)
              mix(vec3(0.3, 0.2, 0.9), vec3(0.1, 0.6, 0.8), h),  // dark mode particles
              u_darkTheme
            );
            
            float glowFactor = mix(0.2, 1.0, u_darkTheme);
            color += m * pColor * (0.5 + 0.5 * pulse) * glowFactor;
            
            // Background depth glow
            float depthGlow = (1.0 - length(st * 0.5)) * 0.15 * glowFactor;
            color += depthGlow * vec3(0.3, 0.2, 0.9);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    function compileShader(source: string, type: number): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const darkThemeLocation = gl.getUniformLocation(program, "u_darkTheme");

    function resize() {
      if (!canvasEl || !gl) return;
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    window.addEventListener("resize", resize);
    resize();

    let reqId: number;

    function render(time: number) {
      if (!gl || !program) return;
      time *= 0.001; // convert to seconds
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvasEl.width, canvasEl.height);
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      gl.uniform1f(darkThemeLocation, isDark ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      reqId = requestAnimationFrame(render);
    }

    reqId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", resize);
      if (gl) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ display: "block", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    />
  );
};

export default ParticleBackground;
