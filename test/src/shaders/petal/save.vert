#version 300 es
// save.vert

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;
out vec3 vPos;
out vec3 vNormal;
out vec3 vExtra;

void main(void) {
	vPos      = position;
	vec3 pos    = vec3(texCoord, 0.0);
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = 1.0;
    vNormal = normal;
	vExtra  = aExtra;
}