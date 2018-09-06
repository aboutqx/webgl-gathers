attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;
uniform   mat4 invMatrix;
uniform   vec3 lightDirection;
uniform   vec3 eyePosition;
uniform   vec4 ambientColor;
uniform   bool mirror;
varying   vec4 vColor;

void main(void){
	vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
	vec3  invEye   = normalize(invMatrix * vec4(eyePosition, 0.0)).xyz;
	vec3  halfLE   = normalize(invLight + invEye);
	float diffuse  = clamp(dot(normal, invLight), 0.1, 1.0);
	float specular = pow(clamp(dot(normal, halfLE), 0.0, 1.0), 50.0);
	vColor         = color * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;
	vec4 pos       = mMatrix * vec4(position, 1.0);
	if(mirror){pos = vec4(pos.x, -pos.y, pos.zw);}
	gl_Position    = vpMatrix * pos;
}
