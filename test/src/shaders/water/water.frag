#version 300 es
precision mediump float;
// basic.frag

in vec2 vTextureCoord;
uniform sampler2D texture0;
out vec4 FragColor;

void main(void) {
    FragColor = texture(texture0, vTextureCoord);
    FragColor = vec4(.0, .1, .5, 1.);
}