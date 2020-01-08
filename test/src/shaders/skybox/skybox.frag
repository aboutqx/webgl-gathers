#version 300 es
#define SHADER_NAME SKYBOX_FRAGMENT

precision mediump float;
in   vec2 TexCoords;
in vec3 vertex;
uniform samplerCube tex;
out vec4 outColor;

void main(void){
    outColor = texture(tex, vertex);
}
