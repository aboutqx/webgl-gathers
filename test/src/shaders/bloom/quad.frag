#version 300 es
precision mediump float;

in vec2 TexCoords;
uniform sampler2D tex;
out vec4 FragColor;

void main (void){
    FragColor = texture(tex, TexCoords);
}