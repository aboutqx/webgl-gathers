#version 300 es
//depth
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 lightSpaceMatrix;
uniform mat4 mMatrix;
out vec2 TexCoord;
out vec3 Normal;
void main(void){
    TexCoord = texCoord;
    Normal = normal;
    gl_Position = lightSpaceMatrix * mMatrix * vec4(position, 1.0);
}
