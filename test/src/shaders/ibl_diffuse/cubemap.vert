attribute vec3 position;
attribute vec2 texCoord;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;

varying vec3 WorldPos;
varying vec2 vUv;
void main(void){
  vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = vpMatrix * pos;

  WorldPos = pos.xyz;
  vUv = texCoord;
}
