import { useEffect, useRef, useState } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/matsumotoShaders';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function WebGLStage({ scene, twist, m, n, proof }) {
  const canvasRef = useRef(null);
  const valuesRef = useRef({ scene, twist, m, n, proof });
  const [error, setError] = useState('');

  useEffect(() => {
    valuesRef.current.scene = scene;
    valuesRef.current.twist = twist;
    valuesRef.current.m = m;
    valuesRef.current.n = n;
    valuesRef.current.proof = proof;
  }, [scene, twist, m, n, proof]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setError('WebGL 2 is unavailable in this browser.');
      return undefined;
    }

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed.';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    };

    let program;
    try {
      const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Program link failed.');
      }
    } catch (shaderError) {
      setError(shaderError.message);
      return undefined;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name) => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: uniform('uResolution'),
      time: uniform('uTime'),
      scene: uniform('uScene'),
      twist: uniform('uTwist'),
      m: uniform('uM'),
      n: uniform('uN'),
      proof: uniform('uProof'),
      yaw: uniform('uYaw'),
      pitch: uniform('uPitch'),
      zoom: uniform('uZoom'),
    };

    const presets = [
      { yaw: 0.34, pitch: -0.20, zoom: 4.65 },
      { yaw: 0.20, pitch: -0.10, zoom: 5.20 },
      { yaw: 0.48, pitch: -0.18, zoom: 4.45 },
      { yaw: 0.30, pitch: -0.12, zoom: 5.30 },
    ];
    const camera = {
      yaw: presets[scene].yaw,
      pitch: presets[scene].pitch,
      zoom: presets[scene].zoom,
      targetYaw: presets[scene].yaw,
      targetPitch: presets[scene].pitch,
      targetZoom: presets[scene].zoom,
      lastScene: scene,
      idleSince: performance.now(),
    };
    const smoothValues = { twist, m, n, proof };
    const drag = { active: false, x: 0, y: 0, yaw: 0, pitch: 0 };

    const resize = () => {
      const mobile = window.innerWidth < 760;
      const renderScale = mobile ? 0.58 : 0.76;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.45) * renderScale;
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const resetCamera = (sceneIndex = valuesRef.current.scene) => {
      const next = presets[sceneIndex];
      camera.targetYaw = next.yaw;
      camera.targetPitch = next.pitch;
      camera.targetZoom = next.zoom;
      camera.idleSince = performance.now();
    };

    const onPointerDown = (event) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.yaw = camera.targetYaw;
      drag.pitch = camera.targetPitch;
      camera.idleSince = performance.now();
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!drag.active) return;
      camera.targetYaw = drag.yaw + (event.clientX - drag.x) * 0.008;
      camera.targetPitch = clamp(
        drag.pitch + (event.clientY - drag.y) * 0.006,
        -1.15,
        1.15
      );
      camera.idleSince = performance.now();
    };

    const stopDrag = (event) => {
      drag.active = false;
      canvas.releasePointerCapture?.(event.pointerId);
      camera.idleSince = performance.now();
    };

    const onWheel = (event) => {
      event.preventDefault();
      camera.targetZoom = clamp(camera.targetZoom + event.deltaY * 0.0035, 3.35, 7.2);
      camera.idleSince = performance.now();
    };

    const onDoubleClick = () => resetCamera();
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('resize', resize);
    resize();

    let frameId;
    let previousTime = performance.now();
    const render = (now) => {
      const dt = Math.min(50, now - previousTime);
      previousTime = now;
      const values = valuesRef.current;

      if (values.scene !== camera.lastScene) {
        camera.lastScene = values.scene;
        resetCamera(values.scene);
      }
      if (!drag.active && now - camera.idleSince > 1800) {
        camera.targetYaw += dt * 0.000055;
      }

      camera.yaw += (camera.targetYaw - camera.yaw) * 0.075;
      camera.pitch += (camera.targetPitch - camera.pitch) * 0.075;
      camera.zoom += (camera.targetZoom - camera.zoom) * 0.075;
      smoothValues.twist += (values.twist - smoothValues.twist) * 0.085;
      smoothValues.m += (values.m - smoothValues.m) * 0.085;
      smoothValues.n += (values.n - smoothValues.n) * 0.085;
      smoothValues.proof += (values.proof - smoothValues.proof) * 0.10;

      resize();
      gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, now / 1000);
      gl.uniform1i(uniforms.scene, values.scene);
      gl.uniform1f(uniforms.twist, smoothValues.twist);
      gl.uniform1f(uniforms.m, smoothValues.m);
      gl.uniform1f(uniforms.n, smoothValues.n);
      gl.uniform1f(uniforms.proof, smoothValues.proof);
      gl.uniform1f(uniforms.yaw, camera.yaw);
      gl.uniform1f(uniforms.pitch, camera.pitch);
      gl.uniform1f(uniforms.zoom, camera.zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', stopDrag);
      canvas.removeEventListener('pointercancel', stopDrag);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDoubleClick);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="webgl-stage"
        aria-label="Orbitable WebGL visualization of the Matsumoto power-twist theorem"
      />
      {error && <div className="webgl-error">{error}</div>}
    </>
  );
}

export default WebGLStage;
