precision highp float;
uniform sampler2D targetBg;
uniform sampler2D texture;
uniform float c1X;
uniform float c1Y;
uniform float c2X;
uniform float c2Y;
varying vec2 uv;
// X directional search matrix.
mat3 GX = mat3( -1.0, 0.0, 1.0,
                -2.0, 0.0, 2.0,
                -1.0, 0.0, 1.0 );
// Y directional search matrix.
mat3 GY =  mat3( 1.0,  2.0,  1.0,
                 0.0,  0.0,  0.0,
                 -1.0, -2.0, -1.0 );

vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}
void main(void) {
  float c1y = c1Y/430.;
  float c1x = c1X/430.;
  float c2y = c2Y/430.;
  float c2x = c2X/430.;

  vec3 col1 = texture2D(texture,vec2(uv.x*1.+c1x,uv.y*1.-c1y)).xyz;
  vec3 col2 = texture2D(targetBg,vec2(uv.x*1.-c2x,uv.y*1.-c2y)).xyz;
  if(col1 == texture2D(texture,vec2(0.,0.)).xyz){
    col1=vec3(1.);
  }
  if(col2 == texture2D(targetBg,vec2(0.,0.)).xyz){
    col2=vec3(1.);
  }
  vec3 col = col1*col2;
  gl_FragColor =vec4(col,1.);
  // float fXIndex = uv.x * fWidth;
  // float fYIndex = uv.y * fHeight;
  // gl_FragColor =
}
