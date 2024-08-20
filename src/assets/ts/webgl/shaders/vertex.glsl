precision mediump float;

uniform float uAspect;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
