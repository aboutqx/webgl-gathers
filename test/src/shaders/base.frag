#version 300 es
precision mediump float;
in   vec4 TexCoords;
out vec4 outColor;


void main(void){

    outColor = texture(tex, TexCoords);
}
