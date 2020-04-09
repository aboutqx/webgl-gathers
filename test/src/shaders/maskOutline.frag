#version 300 es
precision highp float;
in vec3 Pos;
out vec4 outColor;

void main()
{
  outColor = vec4(0.+Pos.x, 0.0, 0.0+Pos.z, .2);
}