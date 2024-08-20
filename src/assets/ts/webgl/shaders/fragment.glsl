precision mediump float;

uniform float uAlpha;
uniform float uAspect;
uniform vec2 uResolution;
uniform vec2 uMousePosition;
uniform float uScroll;
uniform float uTime;

// uniform sampler2D uTexture;

varying vec2 vUv;

#include "./utils/rotate.glsl"

float neuro_shape(vec2 uv, float t, float p) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for(int j = 0; j < 10; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);

    vec2 layer = uv * scale + float(j) + sine_acc - t;

    sine_acc += sin(layer);

    res += (.5 + .5 * cos(layer)) / scale;

    scale *= (1.2 - .07 * p);
  }

  return res.x + res.y;
}

void main() {
  vec2 uv = vUv * uAspect;

  vec2 neuroUv = uv * 0.5;

  vec2 mousePosition = uMousePosition * uAspect;

  float distance = length(uv - mousePosition);

  float p = 0.5 * pow(1.0 - distance, 2.0);

  vec3 color = vec3(0.0);

  float time = 0.8 * uTime;

  float noise = neuro_shape(neuroUv, time, p);

  noise = 1.2 * pow(noise, 3.0);

  noise += pow(noise, 10.0);

  noise *= (1.0 - length(vUv - 0.5));

  color = normalize(vec3(0.8, 0.1 + 0.4 * cos(3.0 * uScroll), 0.1 + 0.5 * sin(3.0 * uScroll)));

  color = color * noise;

  gl_FragColor = vec4(color, uAlpha);
}
