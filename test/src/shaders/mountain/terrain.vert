#version 300 es
// terrain.vert

#define SHADER_NAME TERRAIN_VERTEX

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 uPosition;
uniform vec3 uScale;

out vec2 vTextureCoord;

out vec3 vNormal;
out vec3 vPosition;
out vec3 vWsPosition;
out vec3 vEyePosition;
out vec3 vWsNormal;
out vec4 vViewSpace;


void main(void) {
	vec3 Position      		= position * uScale;
	Position 				+= uPosition;

	vec4 worldSpacePosition	= uModelMatrix * vec4(Position, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;
	
	vec3 N 					= normalize(normal / uScale);
    vNormal					= uNormalMatrix * N;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	vViewSpace				= viewSpacePosition;

	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= texCoord;
}
