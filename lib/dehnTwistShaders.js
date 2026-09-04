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
uniform float uTwist;
uniform float uPulse;
uniform float uYaw;
uniform float uPitch;
uniform float uZoom;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;
const float COLLAR_HALF = 0.30;
const float COLLAR_RADIUS = 0.265;

mat2 rot(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float radius) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
  return length(pa - ba * h) - radius;
}

float sdTorusZ(vec3 p, vec2 radii) {
  vec2 q = vec2(length(p.xy) - radii.x, p.z);
  return length(q) - radii.y;
}

float sdTorusX(vec3 p, vec2 radii) {
  vec2 q = vec2(length(p.yz) - radii.x, p.x);
  return length(q) - radii.y;
}

float genusSurface(vec3 p) {
  p.y *= 1.03;
  float leftHandle = sdTorusZ(
    p - vec3(-0.96, 0.0, 0.0),
    vec2(0.84, 0.29)
  );
  float rightHandle = sdTorusZ(
    p - vec3(0.96, 0.0, 0.0),
    vec2(0.84, 0.29)
  );
  float neck = sdCapsule(
    p,
    vec3(-0.34, 0.0, 0.0),
    vec3(0.34, 0.0, 0.0),
    0.235
  );
  return smin(smin(leftHandle, rightHandle, 0.15), neck, 0.11);
}

float wrappedAngle(float angle) {
  return atan(sin(angle), cos(angle));
}

float twistProfile(float x) {
  return smoothstep(-COLLAR_HALF, COLLAR_HALF, x);
}

float helixCenterDistance(vec3 p, float startAngle, float power) {
  float radius = length(p.yz);
  float theta = atan(p.z, p.y);
  float expected = startAngle + TAU * power * twistProfile(p.x);
  float angular = wrappedAngle(theta - expected) * COLLAR_RADIUS;
  float radial = radius - COLLAR_RADIUS;
  float outside = max(abs(p.x) - COLLAR_HALF, 0.0);
  return length(vec3(radial, angular, outside));
}

float outerCurveDistance(vec3 p) {
  float d = 100.0;

  vec3 l0 = vec3(-0.30, -0.265,  0.000);
  vec3 l1 = vec3(-0.55, -0.700,  0.035);
  vec3 l2 = vec3(-1.12, -1.055,  0.130);
  vec3 l3 = vec3(-1.86, -0.485,  0.205);
  vec3 l4 = vec3(-1.86,  0.485, -0.205);
  vec3 l5 = vec3(-1.12,  1.055, -0.130);
  vec3 l6 = vec3(-0.55,  0.700, -0.035);
  vec3 l7 = vec3(-0.30,  0.265,  0.000);

  vec3 r0 = vec3( 0.30,  0.265,  0.000);
  vec3 r1 = vec3( 0.55,  0.700,  0.035);
  vec3 r2 = vec3( 1.12,  1.055,  0.130);
  vec3 r3 = vec3( 1.86,  0.485,  0.205);
  vec3 r4 = vec3( 1.86, -0.485, -0.205);
  vec3 r5 = vec3( 1.12, -1.055, -0.130);
  vec3 r6 = vec3( 0.55, -0.700, -0.035);
  vec3 r7 = vec3( 0.30, -0.265,  0.000);

  d = smin(d, sdCapsule(p, l0, l1, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l1, l2, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l2, l3, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l3, l4, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l4, l5, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l5, l6, 0.043), 0.020);
  d = smin(d, sdCapsule(p, l6, l7, 0.043), 0.020);

  d = smin(d, sdCapsule(p, r0, r1, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r1, r2, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r2, r3, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r3, r4, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r4, r5, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r5, r6, 0.043), 0.020);
  d = smin(d, sdCapsule(p, r6, r7, 0.043), 0.020);

  return d;
}

vec2 opUnion(vec2 a, vec2 b) {
  return a.x < b.x ? a : b;
}

vec2 mapScene(vec3 p) {
  vec2 result = vec2(genusSurface(p), 1.0);

  float outer = outerCurveDistance(p);
  float currentCrossing = min(
    helixCenterDistance(p, 0.0, uTwist),
    helixCenterDistance(p, PI, uTwist)
  ) - 0.043;
  float ghostCrossing = min(
    helixCenterDistance(p, 0.0, 0.0),
    helixCenterDistance(p, PI, 0.0)
  ) - 0.020;
  float delta = sdTorusX(p, vec2(COLLAR_RADIUS, 0.050));

  result = opUnion(result, vec2(ghostCrossing, 3.0));
  result = opUnion(result, vec2(min(outer, currentCrossing), 2.0));
  result = opUnion(result, vec2(delta, 4.0));
  return result;
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.0018, -0.0018);
  return normalize(
    e.xyy * mapScene(p + e.xyy).x +
    e.yyx * mapScene(p + e.yyx).x +
    e.yxy * mapScene(p + e.yxy).x +
    e.xxx * mapScene(p + e.xxx).x
  );
}

float annulusMask(vec3 p) {
  float xMask = 1.0 - smoothstep(COLLAR_HALF, COLLAR_HALF + 0.17, abs(p.x));
  float radialMask = 1.0 - smoothstep(0.045, 0.16, abs(length(p.yz) - COLLAR_RADIUS));
  return xMask * radialMask;
}

vec3 materialColor(vec3 p, float id) {
  if (id == 2.0) {
    return vec3(0.10, 1.34, 1.10);
  }
  if (id == 3.0) {
    return vec3(0.37, 0.42, 0.51);
  }
  if (id == 4.0) {
    return vec3(1.42, 0.20, 0.70);
  }

  float collar = annulusMask(p);
  vec3 left = vec3(0.105, 0.125, 0.145);
  vec3 right = vec3(0.145, 0.105, 0.150);
  vec3 surface = mix(left, right, smoothstep(-1.85, 1.85, p.x));
  surface *= 1.0 - uPulse * 0.58 * (1.0 - collar);
  surface = mix(surface, vec3(0.56, 0.31, 0.08), uPulse * collar * 0.72);
  return surface;
}

vec3 background(vec2 uv) {
  float radial = length(uv * vec2(0.76, 1.0));
  vec3 center = vec3(0.020, 0.025, 0.050);
  vec3 edge = vec3(0.003, 0.004, 0.012);
  vec3 color = mix(center, edge, smoothstep(0.16, 1.02, radial));
  color += vec3(0.020, 0.012, 0.032) * max(0.0, 1.0 - radial * 1.45);
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
  vec3 rayDirection = normalize(right * uv.x + up * uv.y + forward * 1.70);

  float travelled = 0.0;
  vec2 hit = vec2(0.0);
  float glow = 0.0;
  bool found = false;

  for (int i = 0; i < 92; i++) {
    vec3 p = rayOrigin + rayDirection * travelled;
    hit = mapScene(p);
    float curveWeight = hit.y > 1.5 ? 1.0 : 0.18;
    glow += curveWeight * 0.0014 / (0.025 + abs(hit.x));
    if (abs(hit.x) < 0.0016 * (1.0 + travelled * 0.08)) {
      found = true;
      break;
    }
    travelled += hit.x * 0.72;
    if (travelled > 10.0) break;
  }

  vec3 color = background(uv);

  if (found) {
    vec3 p = rayOrigin + rayDirection * travelled;
    vec3 normal = getNormal(p);
    vec3 lightDirection = normalize(vec3(-0.55, 0.80, 0.58));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float hemisphere = 0.48 + 0.52 * normal.y;
    float rim = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 2.25);
    float specular = pow(
      max(dot(reflect(-lightDirection, normal), -rayDirection), 0.0),
      48.0
    );

    vec3 material = materialColor(p, hit.y);
    float isCurve = hit.y > 1.5 ? 1.0 : 0.0;
    float emission = hit.y == 2.0 ? 0.72 : (hit.y == 4.0 ? 0.88 : 0.14);

    color = material * (0.20 + diffuse * 0.72 + hemisphere * 0.20);
    color += specular * mix(vec3(0.30), vec3(0.90, 1.0, 1.0), isCurve);
    color += rim * mix(vec3(0.10, 0.16, 0.22), material, 0.52) * 0.46;
    color += material * emission;

    float fog = 1.0 - exp(-0.014 * travelled * travelled);
    color = mix(color, background(uv), fog);
  }

  color += glow * vec3(0.015, 0.025, 0.033);
  color = color / (1.0 + color);
  color = pow(color, vec3(0.4545));
  outColor = vec4(color, 1.0);
}`;

export { VERTEX_SHADER, FRAGMENT_SHADER };
