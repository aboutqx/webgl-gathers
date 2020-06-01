#version 300 es
// grass.vert

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;
in vec3 aPosOffset;
in vec3 aColor;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uMaxHeight;
uniform float uTerrainSize;
uniform sampler2D texture0;
uniform sampler2D textureHeight;
uniform sampler2D textureNormal;
uniform sampler2D textureNoise;
uniform float uDistForward;

out vec2 vTexCoord;
out vec2 vUV;
out vec3 vNormal;
out vec3 vGrassNormal;
out vec3 vPosition;
out vec3 vColor;
out float vHeight;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}
 
void main(void) {
	vec3 posOffset 		= aPosOffset * vec3(1.0, 0.0, 1.0);
	posOffset.y 		-= 0.2;
	posOffset.z 		+= uDistForward;
	posOffset.z 		= mod(posOffset.z, uTerrainSize * 2.0);
	posOffset.z 		-= uTerrainSize;

	vec3 cPosition 		= position;
	cPosition.xz 		= rotate(cPosition.xz, aExtra.y);
	vPosition 			= posOffset;
	cPosition 			= posOffset + cPosition * vec3(1.0, aPosOffset.y, 1.0);
	
	float u 			= (cPosition.x / uTerrainSize * 0.5 + 0.5);
	float v 			= 1.0-(cPosition.z / uTerrainSize * 0.5 + 0.5);

	vec2 uv 			= vec2(u, v);
	float colorHeight 	= texture(textureHeight, uv).r;
	cPosition.y 			*= -aPosOffset.y;
	cPosition.y 			+= colorHeight * uMaxHeight;

	vec2 wind 			= texture(textureNoise, uv).rg - .5;
	wind 				*= texCoord.y;
	cPosition.xz 		+= wind * 2.0;


    gl_Position 		= uProjectionMatrix * uViewMatrix * vec4(cPosition, 1.0);
    vTexCoord 		= texCoord;
    vNormal 			= normal;
    vColor 				= aColor;
    vHeight 			= colorHeight;
    vUV					= uv;

    vGrassNormal 		= texture(textureNormal, uv).rgb * 2.0 - 1.0;
}