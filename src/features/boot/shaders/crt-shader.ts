export const crtVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const crtFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uFlicker;
uniform float uScanlineIntensity;
uniform sampler2D uTexture;
uniform bool uHasTexture;

varying vec2 vUv;

vec2 curveUv(vec2 uv) {
  vec2 c = uv - 0.5;
  float r = dot(c, c);
  return uv + c * r * 0.18;
}

void main() {
  vec2 uv = curveUv(vUv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.02, 0.04, 0.02, 1.0);
    return;
  }

  vec3 color = uHasTexture
    ? texture2D(uTexture, uv).rgb
    : vec3(0.04, 0.12, 0.04);

  float scanline = sin((uv.y + uTime * 0.2) * 800.0) * 0.5 + 0.5;
  color *= 1.0 - scanline * uScanlineIntensity;

  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.6;
  color *= clamp(vignette, 0.4, 1.0);

  color += uFlicker * 0.08;
  color *= 0.85 + uFlicker * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
`;
