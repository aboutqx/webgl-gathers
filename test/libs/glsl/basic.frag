#version 300 es
precision mediump float;
// basic.frag

in vec2 vTextureCoord;
uniform sampler2D texture0;
uniform bool flipY;
out vec4 FragColor;

void main(void) {
    if(flipY) FragColor = texture(texture0, vec2(vTextureCoord.x, 1.-vTextureCoord.y));
    else FragColor = texture(texture0, vTextureCoord);
}