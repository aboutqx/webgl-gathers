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
uniform vec3 lightPositon;
uniform vec3 uCameraPos;

out vec2 vTexCoord;
out vec3 vNormal;
out vec4 clipSpace;
out vec3 vToLightVector;
out vec3 vToCameraVector;

void main(void) {
    vec4 worldPosition = mMatrix * vec4(position, 1.0);
    clipSpace = uProjectionMatrix * uViewMatrix * worldPosition;
    gl_Position = clipSpace;
    vTexCoord = texCoord;
    vNormal = normal;
    vToLightVector = lightPositon - worldPosition.xyz/worldPosition.w;
    vToCameraVector = uCameraPos - worldPosition.xyz/worldPosition.w;
}