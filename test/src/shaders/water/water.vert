#version 300 es
// basic.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec4 clipSpace;

void main(void) {
    clipSpace = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.0);
    gl_Position = clipSpace;
    vTextureCoord = texCoord;
    vNormal = normal;
}