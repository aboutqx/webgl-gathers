#version 300 es
// basic.vert

#define SHADER_NAME BASIC_VERTEX
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vTexCoord;
void main(void){

	vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = uProjectionMatrix * uViewMatrix * pos;

    mat3 normalMatrix = transpose(inverse(mat3(mMatrix)));
    vNormal = normalize(normalMatrix * normal);
    
    vPosition = pos.xyz/pos.w;
    vTexCoord = texCoord;
}
