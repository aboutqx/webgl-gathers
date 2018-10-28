#version 300 es
precision mediump float;

in vec3 position;
in vec3 normal;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;

out   vec3 vNormal;
out vec3 WorldPos;

void main(void){

	vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = vpMatrix * pos;

  vNormal = mat3(mMatrix) * normal;
  WorldPos = pos.xyz;

}
