#version 300 es
layout (location = 0) in vec3 position;

uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
    gl_Position = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.0);
}
