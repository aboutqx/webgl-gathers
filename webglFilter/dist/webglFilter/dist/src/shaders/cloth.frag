precision highp float;
uniform sampler2D texture;
uniform float c1X;
uniform float c1Y;
varying vec2 uv;

void main(void) {
  float c1y = c1Y/430.;
  float c1x = c1X/430.;

  vec4 col1 = texture2D(texture,vec2(uv.x*1.+c1x,uv.y*1.-c1y));
  if(length(col1.rgb - texture2D(texture,vec2(0.,0.)).rgb)<=.3){
    col1=vec4(1.);
    // discard;
  }
  gl_FragColor =vec4(col1);
  // float fXIndex = uv.x * fWidth;
  // float fYIndex = uv.y * fHeight;
  // gl_FragColor =
}
