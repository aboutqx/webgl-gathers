#version 300 es
precision highp float;
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

out vec3 FragPos;
out vec2 vTexCoord;
out vec3 Normal;

uniform bool invertedNormals;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
    vec4 viewPos = uViewMatrix * mMatrix * vec4(position, 1.0);
    FragPos = vec3(viewPos);
    vTexCoord = texCoord;

    mat3 normalMatrix = transpose(inverse(mat3(mMatrix)));
    Normal = normalMatrix * (invertedNormals ? -normal : normal);

    gl_Position = uProjectionMatrix * viewPos;
}
