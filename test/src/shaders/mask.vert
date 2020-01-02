#version 300 es
in vec3 position;
in vec2 texCoord;
uniform   mat4 mvpMatrix;
out   vec2 TexCoords;

void main(void){
    TexCoords = texCoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
