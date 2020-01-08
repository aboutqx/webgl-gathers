#version 300 es
#define SHADER_NAME SKYBOX_VERTEX

in vec3 position;
in vec2 texCoord;
uniform   mat4 mvpMatrix;
out   vec2 TexCoords;
out vec3 vertex;


void main(void){
    TexCoords = texCoord;
    vertex = position;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
