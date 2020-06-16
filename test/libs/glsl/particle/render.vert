#version 300 es
// render.vert

precision highp float;
in vec3 position;
in vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture0;
uniform sampler2D textureNext;
uniform float percent;
out vec4 vColor;
out vec3 vNormal;

void main(void) {
	vec2 uv      = position.xy * .5;
	vec3 currPos = texture(texture0, uv).rgb;
	vec3 nextPos = texture(textureNext, uv).rgb;
	vec3 pos     = mix(currPos, nextPos, percent);
	vec4 V       = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position  = V;
	gl_PointSize = 1.2;

	float d 	 = V.z/V.w;
	d 			 = d*.5 + .5;
	vColor       = vec4(d, d, d, 1.0);

	if(length(currPos) - length(nextPos) > 1.0) vColor.a = 0.0;
	vNormal = normal;
}