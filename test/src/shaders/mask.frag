#version 300 es
precision mediump float;
in   vec2 TexCoords;
out vec4 outColor;
uniform sampler2D texture;
uniform float lod;
void main(void){

    outColor = textureLod(texture, TexCoords, lod);
}
