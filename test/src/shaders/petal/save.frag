#version 300 es
// save.frag

precision highp float;

in vec3 vPos;
in vec3 vExtra;

layout (location = 0) out vec4 currentPos;
layout (location = 1) out vec4 extraPos;
layout (location = 2) out vec4 velocity;
void main(void) {
    currentPos = vec4(vPos, 1.0);
    extraPos   = vec4(vExtra, 1.0);
    velocity   =  vec4(0., 0., 0., 1.);
}