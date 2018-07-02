precision highp float;
uniform sampler2D texture;
varying vec2 uv;
void main(void) {
  gl_FragColor = texture2D(texture,vec2(uv.x,uv.y));
  // gl_FragColor = vec4(1.5,1.,.3,1.);
}
