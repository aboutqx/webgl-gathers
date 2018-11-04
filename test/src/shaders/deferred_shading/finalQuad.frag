#version 300 es
precision mediump float;

in vec2 TexCoord;
out vec4 outColor;

void main() {
  outColor = texture();
}
