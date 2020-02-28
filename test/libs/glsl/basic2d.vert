#version 300 es
// basic2d.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 mMatrix;


out vec2 vTextureCoord;
out vec3 vNormal;

void main(void) {
    gl_Position =  mMatrix * vec4(position, 1.0);
    vTextureCoord = texCoord;
    vNormal = normal;
}