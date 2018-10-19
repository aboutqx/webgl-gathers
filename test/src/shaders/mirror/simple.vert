precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;
uniform   bool mirror;
varying   vec3 vNormal;
varying   vec4 vColor;
uniform vec3 eyeDirection;
varying float dist;

void main(void){

	vec4 pos       = mMatrix * vec4(position, 1.0);
	if(mirror){pos = vec4(pos.x, -pos.y, pos.zw);}
	gl_Position    = vpMatrix * pos;

  vNormal = normal;
  vColor      = color;
  dist = distance(position.xyz, eyeDirection);
}
