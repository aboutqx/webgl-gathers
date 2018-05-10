precision highp float;
uniform sampler2D targetBg;
uniform sampler2D texture;
varying vec2 uv;
void main(void) {
  float y = step(0.48,uv.y);
  gl_FragColor = (1.-y)*texture2D(texture,vec2(uv.x*1.9-.45,uv.y*1.86-.0))+y*texture2D(targetBg,vec2(uv.x*1.9-.45,uv.y-.4));
}
