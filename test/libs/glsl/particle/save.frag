#version 300 es
// save.frag

precision highp float;

in vec3 vColor;
out vec4 FragColor;
void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
}