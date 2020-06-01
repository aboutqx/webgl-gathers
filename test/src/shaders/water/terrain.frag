#version 300 es
precision highp float;
// basic.frag

in vec2 vTexCoord;
uniform sampler2D texture0;
out vec4 FragColor;

void main(void) {
    FragColor = texture(texture0, vTexCoord);
    //FragColor = vec4(.0, .7, .5, 1.);
}