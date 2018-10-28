#version 300 es
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

out vec2 TexCoords;
out vec3 Normal;
out vec3 FragPos;

void main()
{
    FragPos = vec3(mMatrix * vec4(position, 1.0));
    Normal = mat3(transpose(inverse(mMatrix))) * normal;
    TexCoords = texCoord;

    gl_Position = pMatrix * vMatrix * vec4(FragPos, 1.0);
}
