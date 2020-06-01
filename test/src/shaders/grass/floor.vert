#version 300 es

// debug.vert
precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform sampler2D texture0;
uniform float uMaxHeight;

out vec2 vTextureCoord;
out vec3 vNormal;
void main(void) {
	vec3 position 			= position;
	float colorHeight 		= texture(texture0, texCoord).r;
	position.y 				+= colorHeight * uMaxHeight;

    gl_Position				= uProjectionMatrix * uViewMatrix * vec4(position, 1.0);

	vTextureCoord			= texCoord;
	vNormal 				= normal;
}