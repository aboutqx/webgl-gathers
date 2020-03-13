#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

out vec3 FragPos;
out vec2 TexCoords;
out vec3 Normal;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
    vec4 worldPos = mMatrix * vec4(position, 1.0);
    FragPos = vec3(worldPos);

    TexCoords = texCoord;

    mat3 normalMatrix = transpose(inverse(mat3(mMatrix)));
    Normal = normalMatrix * normal;

    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
}
