precision highp float;
uniform vec2 px;
uniform sampler2D texture;
uniform float m[9];
varying vec2 uv;

void main(void) {
vec4 c11 = texture2D(texture, uv - px); // top left
vec4 c12 = texture2D(texture, vec2(uv.x, uv.y - px.y)); // top center
vec4 c13 = texture2D(texture, vec2(uv.x + px.x, uv.y - px.y)); // top right

vec4 c21 = texture2D(texture, vec2(uv.x - px.x, uv.y) ); // mid left
vec4 c22 = texture2D(texture, uv); // mid center
vec4 c23 = texture2D(texture, vec2(uv.x + px.x, uv.y) ); // mid right

vec4 c31 = texture2D(texture, vec2(uv.x - px.x, uv.y + px.y) ); // bottom left
vec4 c32 = texture2D(texture, vec2(uv.x, uv.y + px.y) ); // bottom center
vec4 c33 = texture2D(texture, uv + px ); // bottom right

gl_FragColor =
  c11 * m[0] + c12 * m[1] + c22 * m[2] +
  c21 * m[3] + c22 * m[4] + c23 * m[5] +
  c31 * m[6] + c32 * m[7] + c33 * m[8];
  gl_FragColor.a = c22.a;
}
