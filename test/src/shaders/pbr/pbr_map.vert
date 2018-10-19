precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;

varying vec3 vNormal;
varying vec3 WorldPos;
varying vec2 TexCoords;

void main(void){

	vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = vpMatrix * pos;

  vNormal = mat3(mMatrix) * normal;
  WorldPos = pos.xyz;
  TexCoords = texCoord;
}
