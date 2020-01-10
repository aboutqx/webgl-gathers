#version 300 es
#define SHADER_NAME gltf_vert

precision highp float;
in vec3 aVertexPosition;

#ifdef HAS_UV
in vec2 aTextureCoord;
#endif

#ifdef HAS_NORMALS
in vec3 aNormal;
#endif

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;


out vec3 vPosition;
out vec2 vTextureCoord;

#ifdef HAS_NORMALS
out vec3 vNormal;
#endif


void main(void) {
	vec4 position = uModelMatrix * vec4(aVertexPosition, 1.0);
	vPosition     = position.xyz / position.w;
	
	#ifdef HAS_UV
	vTextureCoord = vec2(aTextureCoord.x, 1.0 - aTextureCoord.y);
	#else
	vTextureCoord = vec2(0.,0.);
	#endif

	#ifdef HAS_NORMALS
	vNormal       = normalize(vec3(uModelMatrix * vec4(aNormal, 0.0)));
	#endif
	
	gl_Position   = uProjectionMatrix * uViewMatrix * position;
}
