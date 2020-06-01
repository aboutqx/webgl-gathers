#version 300 es
precision highp float;
// basic.frag

in vec2 vTexCoord;
uniform sampler2D texture0;
uniform bool flipY;
out vec4 FragColor;

void main(void) {
    if(flipY) FragColor = texture(texture0, vec2(vTexCoord.x, 1.-vTexCoord.y));
    else FragColor = texture(texture0, vTexCoord);
}
