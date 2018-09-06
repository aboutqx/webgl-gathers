attribute vec3 position;
attribute vec2 texCoord;
uniform vec3 offset;
varying vec2 vTexCoord;

void main(){
	vTexCoord = texCoord;
	gl_Position = vec4(position + offset, 1.0);
}
