#version 300 es
// basic.vert

#define SHADER_NAME BASIC_VERTEX

in vec3 position;
in vec3 normal;
in vec2 texCoord;
uniform   mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out   vec3 vNormal;
out vec3 vPosition;
out vec2 vTexCoord;
void main(void){

	vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = uProjectionMatrix * uViewMatrix * pos;

    vNormal = mat3(mMatrix) * normal;
    vPosition = pos.xyz/pos.w;
    vTexCoord = texCoord;
}
