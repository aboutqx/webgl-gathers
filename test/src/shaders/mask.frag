#version 300 es
precision highp float;
in   vec2 vTexCoord;
out vec4 outColor;
uniform sampler2D texture;
uniform float lod;
void main(void){

    outColor = textureLod(texture, vTexCoord, lod);
}
