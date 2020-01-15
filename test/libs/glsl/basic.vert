// basic.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = texCoord;
    vNormal = normal;
}