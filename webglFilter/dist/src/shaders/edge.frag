precision highp float;
uniform vec2 px;
uniform sampler2D texture;
uniform float mx[9];
uniform float my[9];
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

  vec4 sumx =
    c11 * mx[0] + c12 * mx[1] + c22 * mx[2] +
    c21 * mx[3] + c22 * mx[4] + c23 * mx[5] +
    c31 * mx[6] + c32 * mx[7] + c33 * mx[8];
  vec4 sumy =
    c11 * my[0] + c12 * my[1] + c22 * my[2] +
    c21 * my[3] + c22 * my[4] + c23 * my[5] +
    c31 * my[6] + c32 * my[7] + c33 * my[8];
  vec4 fTotalSum = sqrt(sumx*sumx + sumy*sumy);

  // Creaing cartoon effect by combining
  // edge informatioon and original image data.
  // fTotalSum = mix( fTotalSum, texture2D( texture,vec2( uv.s, uv.t)), 0.5);


  gl_FragColor = vec4(1.) - fTotalSum ;//变化大的是边缘,更接近于1,所以fTalSum在边缘是1,白色,用1-变成黑色
  gl_FragColor.a = c22.a;
}
