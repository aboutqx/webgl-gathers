#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec4 a = texture2D(from, p);
  vec4 b = texture2D(to, p);
  float f=1.0-p.y;
  if(progress<=0.9999){
  gl_FragColor = mix(a, b, smoothstep(f,f+0.2, progress));
  }else{
    gl_FragColor = mix(a, b, smoothstep(f,f, progress));
  }
}