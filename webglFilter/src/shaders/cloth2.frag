precision highp float;
uniform sampler2D texture;
uniform float c2X;
uniform float c2Y;
varying vec2 uv;

void main(void) {
  float c2y = c2Y/430.;
  float c2x = c2X/430.;

  vec4 col1 = texture2D(texture,vec2(uv.x*1.+c2x,uv.y*1.-c2y));
  if(length(col1.rgb - texture2D(texture,vec2(0.,0.)).rgb)<=.33){
    discard;

  }
  gl_FragColor =vec4(col1);
  // float fXIndex = uv.x * fWidth;
  // float fYIndex = uv.y * fHeight;
  // gl_FragColor =
}
