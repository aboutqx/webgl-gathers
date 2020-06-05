#version 300 es
// sky.vert

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;
out vec3 vNormal;

void main(void) {
	mat4 matView = uViewMatrix;
	// cancle camera position x,y,z move effect
	matView[3][0] = 0.0;
	matView[3][1] = 0.0;
	matView[3][2] = 0.0;
	
    vec4 pos = uProjectionMatrix * matView * uModelMatrix * vec4(position, 1.0);
	gl_Position = pos.xyzw;
    vTexCoord = texCoord;
    vNormal = normal;
}