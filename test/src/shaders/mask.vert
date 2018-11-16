#version 300 es
in vec3 position;
in vec2 texcoord;
uniform   mat4 mvpMatrix;
out   vec2 TexCoords;

void main(void){
    TexCoords = texcoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
