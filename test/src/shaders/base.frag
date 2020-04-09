#version 300 es
precision mediump float;
in   vec4 vTexCoord;
out vec4 outColor;
in sampler2D tex;

void main(void){

    outColor = texture(tex, vTexCoord);
}
