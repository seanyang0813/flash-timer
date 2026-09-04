import { useEffect, useRef, useState } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/matsumotoShaders';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function WebGLStage({ scene, twist, m, n, proof }) {
  const canvasRef = useRef(null);
  const valuesRef = useRef({ scene, twist, m, n, proof });
  const commandsRef = useRef({
    zoomIn: () => {},
    zoomOut: () => {},
    reset: () => {},
  });
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
    const isMobile = () => window.innerWidth < 760;
    const presetZoom = (sceneIndex) => presets[sceneIndex].zoom + (isMobile() ? 0.78 : 0);
    const camera = {
      yaw: presets[scene].yaw,
      pitch: presets[scene].pitch,
      zoom: presetZoom(scene),
      targetYaw: presets[scene].yaw,
      targetPitch: presets[scene].pitch,
      targetZoom: presetZoom(scene),
      lastScene: scene,
      idleSince: performance.now(),
    };
    const smoothValues = { twist, m, n, proof };
    const pointers = new Map();
    const gesture = {
      mode: 'none',
      startX: 0,
      startY: 0,
      startYaw: 0,
      startPitch: 0,
      startDistance: 0,
      startZoom: camera.targetZoom,
      downAt: 0,
      moved: false,
      lastTapAt: 0,
      lastTapX: 0,
      lastTapY: 0,
    };

    const resize = () => {
      const mobile = isMobile();
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
      camera.targetZoom = presetZoom(sceneIndex);
      camera.idleSince = performance.now();
    };

    const nudgeZoom = (amount) => {
      camera.targetZoom = clamp(camera.targetZoom + amount, 2.72, 8.60);
      camera.idleSince = performance.now();
    };

    commandsRef.current = {
      zoomIn: () => nudgeZoom(-0.52),
      zoomOut: () => nudgeZoom(0.52),
      reset: () => resetCamera(),
    };

    const beginOrbit = (pointer) => {
      gesture.mode = 'orbit';
      gesture.startX = pointer.x;
      gesture.startY = pointer.y;
      gesture.startYaw = camera.targetYaw;
      gesture.startPitch = camera.targetPitch;
      gesture.downAt = performance.now();
      gesture.moved = false;
    };

    const beginPinch = () => {
      const pair = Array.from(pointers.values()).slice(0, 2);
      if (pair.length < 2) return;
      gesture.mode = 'pinch';
      gesture.startDistance = Math.max(1, distanceBetween(pair[0], pair[1]));
      gesture.startZoom = camera.targetZoom;
      gesture.moved = true;
    };

    const continueAfterPointerChange = () => {
      if (pointers.size >= 2) {
        beginPinch();
        return;
      }
      if (pointers.size === 1) {
        beginOrbit(Array.from(pointers.values())[0]);
        gesture.moved = true;
        return;
      }
      gesture.mode = 'none';
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      camera.idleSince = performance.now();
      if (pointers.size === 1) beginOrbit(pointers.get(event.pointerId));
      if (pointers.size === 2) beginPinch();
    };

    const onPointerMove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      camera.idleSince = performance.now();

      if (pointers.size >= 2) {
        if (gesture.mode !== 'pinch') beginPinch();
        const pair = Array.from(pointers.values()).slice(0, 2);
        const currentDistance = Math.max(1, distanceBetween(pair[0], pair[1]));
        const ratio = gesture.startDistance / currentDistance;
        camera.targetZoom = clamp(
          gesture.startZoom * Math.pow(ratio, 0.92),
          2.72,
          8.60
        );
        return;
      }

      if (gesture.mode !== 'orbit') beginOrbit(pointers.get(event.pointerId));
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (Math.hypot(deltaX, deltaY) > 4) gesture.moved = true;
      camera.targetYaw = gesture.startYaw + deltaX * 0.008;
      camera.targetPitch = clamp(
        gesture.startPitch + deltaY * 0.006,
        -1.15,
        1.15
      );
    };

    const stopPointer = (event, cancelled = false) => {
      if (!pointers.has(event.pointerId)) return;
      const wasOnlyPointer = pointers.size === 1;
      const point = pointers.get(event.pointerId);
      const now = performance.now();
      const isTap = !cancelled
        && wasOnlyPointer
        && !gesture.moved
        && now - gesture.downAt < 280;

      pointers.delete(event.pointerId);
      canvas.releasePointerCapture?.(event.pointerId);
      camera.idleSince = now;

      if (isTap) {
        const closeToLastTap = Math.hypot(
          point.x - gesture.lastTapX,
          point.y - gesture.lastTapY
        ) < 32;
        if (now - gesture.lastTapAt < 340 && closeToLastTap) {
          resetCamera();
          gesture.lastTapAt = 0;
        } else {
          gesture.lastTapAt = now;
          gesture.lastTapX = point.x;
          gesture.lastTapY = point.y;
        }
      }

      continueAfterPointerChange();
    };

    const onPointerUp = (event) => stopPointer(event, false);
    const onPointerCancel = (event) => stopPointer(event, true);
    const onWheel = (event) => {
      event.preventDefault();
      camera.targetZoom = clamp(camera.targetZoom + event.deltaY * 0.0035, 2.72, 8.60);
      camera.idleSince = performance.now();
    };
    const onDoubleClick = () => resetCamera();

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
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
      if (pointers.size === 0 && now - camera.idleSince > 1800) {
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
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDoubleClick);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      commandsRef.current = {
        zoomIn: () => {},
        zoomOut: () => {},
        reset: () => {},
      };
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="webgl-stage"
        aria-label="Orbitable WebGL visualization of the Matsumoto power-twist theorem"
      />
      <div className="camera-controls" aria-label="Camera controls">
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => commandsRef.current.zoomOut()}
        >
          −
        </button>
        <button
          type="button"
          className="reset-camera"
          aria-label="Reset camera"
          title="Reset camera"
          onClick={() => commandsRef.current.reset()}
        >
          ↺
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => commandsRef.current.zoomIn()}
        >
          +
        </button>
      </div>
      {error && <div className="webgl-error">{error}</div>}
    </>
  );
}

export default WebGLStage;
