export const crtScreenVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const crtScreenFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uFlicker;
uniform float uPower;
uniform float uScanlineIntensity;
uniform float uChromatic;
uniform sampler2D uTexture;
uniform bool uHasTexture;

varying vec2 vUv;

vec2 barrelUv(vec2 uv) {
  vec2 c = uv - 0.5;
  float r = dot(c, c);
  return uv + c * r * 0.14;
}

void main() {
  vec2 uv = barrelUv(vUv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.01, 0.02, 0.01, 1.0);
    return;
  }

  float ca = uChromatic * 0.002;
  vec3 color = uHasTexture
    ? vec3(
        texture2D(uTexture, uv + vec2(ca, 0.0)).r,
        texture2D(uTexture, uv).g,
        texture2D(uTexture, uv - vec2(ca, 0.0)).b
      )
    : vec3(0.03, 0.1, 0.03);

  color *= uPower;

  float scanline = sin((uv.y + uTime * 0.35) * 900.0) * 0.5 + 0.5;
  color *= 1.0 - scanline * uScanlineIntensity;

  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.8;
  color *= clamp(vignette, 0.35, 1.0);

  float noise = fract(sin(dot(uv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
  color += (noise - 0.5) * 0.015 * uPower;

  color += uFlicker * 0.06;
  color *= 0.82 + uFlicker * 0.18;

  gl_FragColor = vec4(color, 1.0);
}
`;
