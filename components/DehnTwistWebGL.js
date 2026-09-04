import { useEffect, useRef, useState } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/dehnTwistShaders';

const TAU = Math.PI * 2;
const COLLAR_HALF = 0.30;
const COLLAR_RADIUS = 0.265;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const length3 = (v) => Math.hypot(v.x, v.y, v.z);
const normalize3 = (v) => {
  const length = Math.max(length3(v), 1e-8);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
};
const dot3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross3 = (a, b) => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const distance3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const distance2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function cameraOrigin(yaw, pitch, zoom) {
  const pitchCos = Math.cos(-pitch);
  const pitchSin = Math.sin(-pitch);
  let x = 0;
  let y = -pitchSin * zoom;
  let z = pitchCos * zoom;
  const yawCos = Math.cos(yaw);
  const yawSin = Math.sin(yaw);
  const nextX = yawCos * x - yawSin * z;
  const nextZ = yawSin * x + yawCos * z;
  x = nextX;
  z = nextZ;
  return { x, y, z };
}

function projectPoint(point, camera, width, height) {
  const origin = cameraOrigin(camera.yaw, camera.pitch, camera.zoom);
  const forward = normalize3({ x: -origin.x, y: -origin.y, z: -origin.z });
  const right = normalize3(cross3(forward, { x: 0, y: 1, z: 0 }));
  const up = cross3(right, forward);
  const relative = {
    x: point.x - origin.x,
    y: point.y - origin.y,
    z: point.z - origin.z,
  };
  const depth = dot3(relative, forward);
  if (depth <= 0.05) return null;
  const scale = Math.min(width, height);
  const u = 1.70 * dot3(relative, right) / depth;
  const v = 1.70 * dot3(relative, up) / depth;
  const x = width * 0.5 + u * scale;
  const y = height * 0.5 - v * scale;
  if (x < -80 || x > width + 80 || y < -80 || y > height + 80) return null;
  return { x, y, depth };
}

function closestToCamera(points, camera) {
  const origin = cameraOrigin(camera.yaw, camera.pitch, camera.zoom);
  return points.reduce((best, point) => (
    distance3(point, origin) < distance3(best, origin) ? point : best
  ));
}

function setLabelPosition(element, point, camera, width, height) {
  if (!element) return;
  const projected = projectPoint(point, camera, width, height);
  if (!projected) {
    element.style.opacity = '0';
    return;
  }
  element.style.opacity = '1';
  element.style.transform = `translate3d(${projected.x}px, ${projected.y}px, 0)`;
}

function DehnTwistWebGL({ twist, pulse, targetN, clean = false }) {
  const canvasRef = useRef(null);
  const deltaLabelRef = useRef(null);
  const curveLabelRef = useRef(null);
  const ghostLabelRef = useRef(null);
  const valuesRef = useRef({ twist, pulse, targetN });
  const commandsRef = useRef({ zoomIn: () => {}, zoomOut: () => {}, reset: () => {} });
  const [error, setError] = useState('');

  useEffect(() => {
    valuesRef.current = { twist, pulse, targetN };
  }, [twist, pulse, targetN]);

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
      setError('WebGL 2 is unavailable in this browser. Use Flatten twist instead.');
      return undefined;
    }

    const compile = (type, source) => {
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
      const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Program link failed.');
      }
    } catch (shaderError) {
      setError(shaderError.message);
      return undefined;
    }

    gl.useProgram(program);
    const triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
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
      twist: uniform('uTwist'),
      pulse: uniform('uPulse'),
      yaw: uniform('uYaw'),
      pitch: uniform('uPitch'),
      zoom: uniform('uZoom'),
    };

    const isMobile = () => window.innerWidth < 760;
    const preset = () => (
      isMobile()
        ? { yaw: 0.42, pitch: -0.18, zoom: 6.9 }
        : { yaw: 0.42, pitch: -0.20, zoom: 4.65 }
    );
    const initial = preset();
    const camera = {
      yaw: initial.yaw,
      pitch: initial.pitch,
      zoom: initial.zoom,
      targetYaw: initial.yaw,
      targetPitch: initial.pitch,
      targetZoom: initial.zoom,
      idleSince: performance.now(),
    };
    const pointers = new Map();
    const gesture = {
      mode: 'none',
      startX: 0,
      startY: 0,
      startYaw: 0,
      startPitch: 0,
      startDistance: 0,
      startZoom: camera.zoom,
    };

    const reset = () => {
      const next = preset();
      camera.targetYaw = next.yaw;
      camera.targetPitch = next.pitch;
      camera.targetZoom = next.zoom;
      camera.idleSince = performance.now();
    };
    const nudgeZoom = (amount) => {
      camera.targetZoom = clamp(camera.targetZoom + amount, 3.25, 10.5);
      camera.idleSince = performance.now();
    };
    commandsRef.current = {
      zoomIn: () => nudgeZoom(-0.62),
      zoomOut: () => nudgeZoom(0.62),
      reset,
    };

    let mobileState = isMobile();
    const resize = () => {
      const mobile = isMobile();
      const renderScale = mobile ? 0.64 : 0.82;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5) * renderScale;
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      if (mobile !== mobileState) {
        mobileState = mobile;
        reset();
      }
    };

    const beginOrbit = (point) => {
      gesture.mode = 'orbit';
      gesture.startX = point.x;
      gesture.startY = point.y;
      gesture.startYaw = camera.targetYaw;
      gesture.startPitch = camera.targetPitch;
    };
    const beginPinch = () => {
      const points = Array.from(pointers.values()).slice(0, 2);
      if (points.length < 2) return;
      gesture.mode = 'pinch';
      gesture.startDistance = Math.max(1, distance2(points[0], points[1]));
      gesture.startZoom = camera.targetZoom;
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) beginOrbit(pointers.get(event.pointerId));
      if (pointers.size >= 2) beginPinch();
      camera.idleSince = performance.now();
    };
    const onPointerMove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      camera.idleSince = performance.now();

      if (pointers.size >= 2) {
        if (gesture.mode !== 'pinch') beginPinch();
        const points = Array.from(pointers.values()).slice(0, 2);
        const currentDistance = Math.max(1, distance2(points[0], points[1]));
        camera.targetZoom = clamp(
          gesture.startZoom * Math.pow(gesture.startDistance / currentDistance, 0.92),
          3.25,
          10.5
        );
        return;
      }

      const point = pointers.get(event.pointerId);
      if (gesture.mode !== 'orbit') beginOrbit(point);
      camera.targetYaw = gesture.startYaw + (point.x - gesture.startX) * 0.008;
      camera.targetPitch = clamp(
        gesture.startPitch + (point.y - gesture.startY) * 0.006,
        -1.12,
        1.12
      );
    };
    const finishPointer = (event) => {
      pointers.delete(event.pointerId);
      canvas.releasePointerCapture?.(event.pointerId);
      if (pointers.size >= 2) beginPinch();
      else if (pointers.size === 1) beginOrbit(Array.from(pointers.values())[0]);
      else gesture.mode = 'none';
      camera.idleSince = performance.now();
    };
    const onWheel = (event) => {
      event.preventDefault();
      camera.targetZoom = clamp(camera.targetZoom + event.deltaY * 0.0035, 3.25, 10.5);
      camera.idleSince = performance.now();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', finishPointer);
    canvas.addEventListener('pointercancel', finishPointer);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', reset);
    window.addEventListener('resize', resize);
    resize();

    let frameId;
    let previous = performance.now();
    const render = (now) => {
      const dt = Math.min(50, now - previous);
      previous = now;
      if (pointers.size === 0 && now - camera.idleSince > 2200) {
        camera.targetYaw += dt * 0.000035;
      }
      camera.yaw += (camera.targetYaw - camera.yaw) * 0.085;
      camera.pitch += (camera.targetPitch - camera.pitch) * 0.085;
      camera.zoom += (camera.targetZoom - camera.zoom) * 0.085;

      resize();
      const values = valuesRef.current;
      gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, now / 1000);
      gl.uniform1f(uniforms.twist, values.twist);
      gl.uniform1f(uniforms.pulse, values.pulse);
      gl.uniform1f(uniforms.yaw, camera.yaw);
      gl.uniform1f(uniforms.pitch, camera.pitch);
      gl.uniform1f(uniforms.zoom, camera.zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      const origin = cameraOrigin(camera.yaw, camera.pitch, camera.zoom);
      const thetaFront = Math.atan2(origin.z, origin.y);
      const deltaPoint = {
        x: 0,
        y: COLLAR_RADIUS * Math.cos(thetaFront),
        z: COLLAR_RADIUS * Math.sin(thetaFront),
      };

      const anchorX = 0.11;
      const profile = smoothstep(-COLLAR_HALF, COLLAR_HALF, anchorX);
      const currentAngle = TAU * values.twist * profile;
      const currentPoint = closestToCamera([
        {
          x: anchorX,
          y: COLLAR_RADIUS * Math.cos(currentAngle),
          z: COLLAR_RADIUS * Math.sin(currentAngle),
        },
        {
          x: anchorX,
          y: COLLAR_RADIUS * Math.cos(currentAngle + Math.PI),
          z: COLLAR_RADIUS * Math.sin(currentAngle + Math.PI),
        },
      ], camera);
      const ghostX = -0.13;
      const ghostPoint = closestToCamera([
        { x: ghostX, y: COLLAR_RADIUS, z: 0 },
        { x: ghostX, y: -COLLAR_RADIUS, z: 0 },
      ], camera);

      setLabelPosition(deltaLabelRef.current, deltaPoint, camera, cssWidth, cssHeight);
      setLabelPosition(curveLabelRef.current, currentPoint, camera, cssWidth, cssHeight);
      if (Math.abs(values.twist) > 0.12) {
        setLabelPosition(ghostLabelRef.current, ghostPoint, camera, cssWidth, cssHeight);
      } else if (ghostLabelRef.current) {
        ghostLabelRef.current.style.opacity = '0';
      }

      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', finishPointer);
      canvas.removeEventListener('pointercancel', finishPointer);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', reset);
      gl.deleteBuffer(triangle);
      gl.deleteProgram(program);
      commandsRef.current = { zoomIn: () => {}, zoomOut: () => {}, reset: () => {} };
    };
  }, []);

  const currentLabel = targetN === 0
    ? <><i className="curve-swatch current" />a = d<sup>0</sup>(a)</>
    : <><i className="curve-swatch current" />d<sup>{targetN}</sup>(a)</>;

  return (
    <div className={`dehn-webgl ${clean ? 'clean' : ''}`}>
      <canvas
        ref={canvasRef}
        className="dehn-canvas"
        aria-label="Orbitable genus-two surface with fixed separating curve delta and the transformed test curve d to the n of a"
      />

      <div ref={deltaLabelRef} className="curve-label delta-label">
        <i className="curve-swatch delta" />δ <small>fixed</small>
      </div>
      <div ref={curveLabelRef} className="curve-label current-label">
        {currentLabel}
      </div>
      <div ref={ghostLabelRef} className="curve-label ghost-label">
        <i className="curve-swatch ghost" />a <small>original</small>
      </div>

      {!clean && (
        <div className="camera-tools" aria-label="3D camera controls">
          <button type="button" onClick={() => commandsRef.current.zoomOut()} aria-label="Zoom out">−</button>
          <button type="button" className="reset" onClick={() => commandsRef.current.reset()} aria-label="Reset camera">↺</button>
          <button type="button" onClick={() => commandsRef.current.zoomIn()} aria-label="Zoom in">+</button>
        </div>
      )}
      {error && <div className="dehn-error">{error}</div>}
    </div>
  );
}

export default DehnTwistWebGL;
