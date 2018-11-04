#version 300 es
in vec3 position;
in vec2 texCoord;

out vec2 TexCoord;
void main(){
  TexCoord = texCoord;
  gl_Position = vec4(position, 1.);
}
