#version 300 es

in vec3 position;
in vec3 normal;
uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

out vec3 Normal;
out vec3 Position;

void main()
{
    Normal = mat3(transpose(inverse(mMatrix))) * normal;
    Position = vec3(mMatrix * vec4(position, 1.0));
    gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.0);
}  