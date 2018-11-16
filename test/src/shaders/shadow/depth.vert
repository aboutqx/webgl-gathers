#version 300 es
in vec3 position;

uniform mat4 lightSpaceMatrix;
uniform mat4 mMatrix;

void main(void){
    gl_Position = lightSpaceMatrix * mMatrix * vec4(position, 1.0);
}
