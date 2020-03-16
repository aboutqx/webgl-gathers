#version 300 es
precision mediump float;

in vec2 position;
out vec2 vTexCoord;



void main(void){


	gl_Position    = vec4(position, 0., 1.);
	vTexCoord = position * .5 + .5;
}
