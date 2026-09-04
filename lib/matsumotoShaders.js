const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform int uScene;
uniform float uTwist;
uniform float uM;
uniform float uN;
uniform float uProof;
uniform float uYaw;
uniform float uPitch;
uniform float uZoom;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdTorusZ(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xy) - t.x, p.z);
  return length(q) - t.y;
}

float sdTorusX(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.yz) - t.x, p.x);
  return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float doubleTorus(vec3 p) {
  p.y *= 1.04;
  float leftHandle = sdTorusZ(p - vec3(-0.96, 0.0, 0.0), vec2(0.84, 0.29));
  float rightHandle = sdTorusZ(p - vec3(0.96, 0.0, 0.0), vec2(0.84, 0.29));
  float neck = sdCapsule(p, vec3(-0.27, 0.0, 0.0), vec3(0.27, 0.0, 0.0), 0.235);
  return smin(smin(leftHandle, rightHandle, 0.15), neck, 0.12);
}

vec2 opUnion(vec2 a, vec2 b) { return a.x < b.x ? a : b; }

vec2 sceneMap(vec3 p) {
  if (uScene == 0) {
    vec2 result = vec2(doubleTorus(p), 1.0);
    result = opUnion(result, vec2(sdTorusX(p, vec2(0.31, 0.018)), 7.0));
    return result;
  }

  if (uScene == 1) {
    vec3 q1 = (p - vec3(-1.36, 0.0, 0.0)) / 0.58;
    vec3 q2 = (p - vec3(1.36, 0.0, 0.0)) / 0.58;
    vec2 result = vec2(doubleTorus(q1) * 0.58, 1.0);
    result = opUnion(result, vec2(doubleTorus(q2) * 0.58, 2.0));
    result = opUnion(result, vec2(sdTorusX(q1, vec2(0.31, 0.022)) * 0.58, 7.0));
    result = opUnion(result, vec2(sdTorusX(q2, vec2(0.31, 0.022)) * 0.58, 8.0));
    return result;
  }

  if (uScene == 2) {
    float q = clamp(uProof, 0.0, 1.0);
    float split = smoothstep(0.20, 0.60, q);
    float separation = mix(0.0, 0.92, split);
    float radius = mix(1.02, 0.64, split);
    float originalSphere = sdSphere(p, 1.02);
    float cuffs = smin(
      sdSphere(p - vec3(-separation, 0.0, 0.0), radius),
      sdSphere(p - vec3(separation, 0.0, 0.0), radius),
      0.18
    );
    vec2 result = vec2(mix(originalSphere, cuffs, split), 3.0);

    float sectionHide = smoothstep(0.20, 0.46, q) * 1.6;
    float sectionOne = sdCapsule(
      p,
      vec3(-0.34, -1.28, 0.0),
      vec3(-0.34, 1.28, 0.0),
      0.038
    ) + sectionHide;
    float sectionTwo = sdCapsule(
      p,
      vec3(0.34, -1.28, 0.0),
      vec3(0.34, 1.28, 0.0),
      0.038
    ) + sectionHide;
    result = opUnion(result, vec2(sectionOne, 4.0));
    result = opUnion(result, vec2(sectionTwo, 4.0));

    float barReveal = smoothstep(0.46, 0.75, q);
    float bar = sdCapsule(
      p,
      vec3(-separation, 0.0, 0.0),
      vec3(separation, 0.0, 0.0),
      0.105
    ) + (1.0 - barReveal) * 1.3;
    result = opUnion(result, vec2(bar, 6.0));

    float finalReveal = smoothstep(0.68, 0.94, q);
    float deltaRing = sdTorusX(p, vec2(0.27, 0.022)) + (1.0 - finalReveal) * 1.4;
    result = opUnion(result, vec2(deltaRing, 7.0));

    float dots = 10.0;
    vec3 a = vec3(-separation, 0.34, 0.53);
    vec3 b = vec3(-separation, -0.34, 0.53);
    vec3 c = vec3(separation, 0.34, 0.53);
    vec3 d = vec3(separation, -0.34, 0.53);
    dots = min(
      min(sdSphere(p - a, 0.055), sdSphere(p - b, 0.055)),
      min(sdSphere(p - c, 0.055), sdSphere(p - d, 0.055))
    ) + (1.0 - finalReveal);
    result = opUnion(result, vec2(dots, 5.0));
    return result;
  }

  vec2 result = vec2(sdSphere(p, 0.72), 9.0);
  result = opUnion(result, vec2(sdTorusZ(p, vec2(0.95, 0.025)), 7.0));
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float a = fi / 6.0 * TAU + uTime * 0.13;
    vec3 center = vec3(
      cos(a) * 2.05,
      sin(a) * 1.18,
      sin(a * 1.7 + uTime * 0.25) * 0.55
    );
    vec3 q = (p - center) / 0.19;
    q.xy = rot(-a - uTime * 0.23) * q.xy;
    result = opUnion(result, vec2(doubleTorus(q) * 0.19, 10.0 + fi));
  }
  return result;
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.0018, -0.0018);
  return normalize(
    e.xyy * sceneMap(p + e.xyy).x +
    e.yyx * sceneMap(p + e.yyx).x +
    e.yxy * sceneMap(p + e.yxy).x +
    e.xxx * sceneMap(p + e.xxx).x
  );
}

vec3 palette(float t) {
  vec3 a = vec3(0.52);
  vec3 b = vec3(0.48);
  vec3 c = vec3(1.0);
  vec3 d = vec3(0.08, 0.31, 0.57);
  return a + b * cos(TAU * (c * t + d));
}

vec3 baseMaterial(vec3 p, float id) {
  if (id == 7.0) return vec3(1.35, 0.22, 0.78);
  if (id == 8.0) return vec3(0.28, 1.20, 1.35);

  if (uScene == 0 || uScene == 1) {
    vec3 q = p;
    float twist = uTwist;
    if (uScene == 1) {
      if (id < 1.5) {
        q = (p - vec3(-1.36, 0.0, 0.0)) / 0.58;
        twist = uM;
      } else {
        q = (p - vec3(1.36, 0.0, 0.0)) / 0.58;
        twist = uN;
      }
    }

    float angle = atan(q.z, q.y) / TAU;
    float shear = smoothstep(-0.64, 0.64, q.x);
    float phase = angle - twist * shear;
    float stripeDistance = abs(fract(phase * 7.0 + 0.5) - 0.5);
    float stripe = 1.0 - smoothstep(0.026, 0.075, stripeDistance);
    float collar = 1.0 - smoothstep(0.62, 1.16, abs(q.x));
    vec3 leftColor = vec3(0.055, 0.18, 0.22);
    vec3 rightColor = vec3(0.24, 0.07, 0.22);
    vec3 base = mix(leftColor, rightColor, smoothstep(-1.8, 1.8, q.x));
    vec3 stripeColor = palette(phase * 1.7 + twist * 0.03);
    float pulse = pow(max(0.0, cos((phase * 7.0 - uTime * 0.38) * TAU)), 34.0);
    return mix(base, stripeColor, stripe * collar * 0.94)
      + stripeColor * pulse * stripe * 0.65;
  }

  if (uScene == 2) {
    if (id == 4.0) return vec3(0.35, 0.38, 0.48);
    if (id == 5.0) return vec3(0.22, 1.30, 1.40);
    if (id == 6.0) return vec3(0.25, 0.95, 0.78);
    return mix(
      vec3(0.08, 0.24, 0.28),
      vec3(0.30, 0.10, 0.38),
      smoothstep(-1.2, 1.2, p.x)
    );
  }

  if (id == 9.0) return vec3(0.18, 0.95, 0.72);
  return palette(id * 0.11 + uTime * 0.025) * 0.8;
}

vec3 background(vec3 rd) {
  float v = 0.5 + 0.5 * rd.y;
  vec3 color = mix(vec3(0.004, 0.005, 0.018), vec3(0.018, 0.012, 0.052), v);
  vec2 sphereUv = vec2(
    atan(rd.z, rd.x) / TAU + 0.5,
    asin(clamp(rd.y, -1.0, 1.0)) / PI + 0.5
  );
  vec2 cell = floor(sphereUv * vec2(420.0, 210.0));
  float h = hash21(cell);
  float star = smoothstep(0.994, 1.0, h);
  star *= 0.55 + 0.45 * sin(uTime * (0.6 + h * 2.0) + h * 90.0);
  color += star * vec3(0.55, 0.72, 1.0);
  float aurora = pow(max(0.0, 1.0 - abs(rd.y + 0.08)), 7.0);
  color += aurora * vec3(0.02, 0.05, 0.08);
  return color;
}

void main() {
  float viewportScale = min(uResolution.x, uResolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / viewportScale;
  vec3 rayOrigin = vec3(0.0, 0.0, uZoom);
  rayOrigin.yz = rot(-uPitch) * rayOrigin.yz;
  rayOrigin.xz = rot(uYaw) * rayOrigin.xz;
  vec3 forward = normalize(-rayOrigin);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 rayDirection = normalize(right * uv.x + up * uv.y + forward * 1.72);

  float distanceTravelled = 0.0;
  vec2 hitInfo = vec2(0.0);
  float glow = 0.0;
  bool hit = false;

  for (int i = 0; i < 96; i++) {
    vec3 p = rayOrigin + rayDirection * distanceTravelled;
    hitInfo = sceneMap(p);
    glow += 0.0022 / (0.035 + abs(hitInfo.x));
    if (abs(hitInfo.x) < 0.0015 * (1.0 + 0.08 * distanceTravelled)) {
      hit = true;
      break;
    }
    distanceTravelled += hitInfo.x * 0.72;
    if (distanceTravelled > 11.0) break;
  }

  vec3 color = background(rayDirection);
  if (hit) {
    vec3 p = rayOrigin + rayDirection * distanceTravelled;
    vec3 normal = getNormal(p);
    vec3 lightDirection = normalize(vec3(-0.55, 0.82, 0.48));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float hemisphere = 0.5 + 0.5 * normal.y;
    float rim = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 2.4);
    float specular = pow(
      max(dot(reflect(-lightDirection, normal), -rayDirection), 0.0),
      52.0
    );
    vec3 material = baseMaterial(p, hitInfo.y);
    float emissive = (
      hitInfo.y == 7.0 ||
      hitInfo.y == 8.0 ||
      hitInfo.y == 5.0
    ) ? 1.0 : 0.0;
    color = material * (0.18 + 0.78 * diffuse + 0.24 * hemisphere);
    color += specular * vec3(0.75, 0.90, 1.0);
    color += rim * mix(
      vec3(0.15, 0.90, 0.75),
      vec3(0.75, 0.25, 1.0),
      0.5 + 0.5 * sin(p.x)
    ) * 0.55;
    color += material * emissive * 0.65;
    float fog = 1.0 - exp(-0.018 * distanceTravelled * distanceTravelled);
    color = mix(color, background(rayDirection), fog);
  }

  color += glow * vec3(0.006, 0.012, 0.020);
  color = color / (1.0 + color);
  color = pow(color, vec3(0.4545));
  outColor = vec4(color, 1.0);
}`;

export { VERTEX_SHADER, FRAGMENT_SHADER };
