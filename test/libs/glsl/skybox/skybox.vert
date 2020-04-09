#version 300 es
#define SHADER_NAME SKYBOX_VERTEX
precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;
uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
out   vec2 vTexCoord;
out vec3 vertex;
out vec3 vNormal;

void main(void){
    vTexCoord = texCoord;
    vertex = position;
    vNormal = normal;
    vec4 pos = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.0);
    gl_Position = pos.xyww;
}
