// copy.frag
#version 300 es
#define SHADER_NAME COPY_FRAGMENT

precision highp float;

in vec2 vTexCoord;
uniform sampler2D texture0;
out vec4 FragColor;
void main(void) {
    FragColor = texture(texture0, vTexCoord);
}
