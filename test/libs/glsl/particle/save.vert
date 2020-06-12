#version 300 es
// save.vert

precision highp float;
in vec3 position;
in vec2 texCoord;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;
out vec3 vColor;
out vec3 vNormal;

void main(void) {
	vColor      = position;
	vec3 pos    = vec3(texCoord, 0.0);
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = 1.0;
    vNormal = normal;
}