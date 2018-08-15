//simple2d.vert
  precision highp float;
  attribute vec3 position;

  uniform float flipY;
  varying vec2 uv;

  void main(void) {
    gl_Position = vec4(-position.x, position.y*flipY, position.z, 1.);
    uv = -position.xy*.5+.5;
    
  }
