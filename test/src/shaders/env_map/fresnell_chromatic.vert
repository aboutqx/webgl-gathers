#version 300 es
precision highp float;
in vec3 position;
in vec3 normal;
in vec2 texCoord;
uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 Normal;
out vec3 Position;
out vec2 vTexCoord;
void main()
{
    Normal = mat3(transpose(inverse(mMatrix))) * normal;
    Position = vec3(mMatrix * vec4(position, 1.0));
    vTexCoord = texCoord;
    gl_Position = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.0);
}  