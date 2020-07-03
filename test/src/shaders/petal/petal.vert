#version 300 es
// petal.vert

precision highp float;
in vec3 position;
in vec3 normal;
in vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float time;
out vec4 vColor;
out vec3 vNormal;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

void main(void) {

	vec3 currPos = texture(textureCurr, aUV).rgb;
	vec3 nextPos = texture(textureNext, aUV).rgb;
    vec3 extra   = texture(textureExtra, aUV).rgb;
	vec3 pos     = mix(currPos, nextPos, percent);

    float scale = 0.1 + extra.g * 0.3;
	vec3 Position = rotate(position, normalize(extra), time * extra.r + extra.b) * scale;
	Position += pos;

	vec4 V       = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(Position, 1.0);
	gl_Position  = V;


	vNormal = normal;
}