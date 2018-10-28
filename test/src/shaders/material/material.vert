#version 300 es
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;

out vec3 Normal;
out vec3 FragPos;
void main()
{
  Normal = mat3(transpose(inverse(mMatrix))) * normal; // 法线矩阵 修复不等比缩放
  FragPos = vec3(mMatrix * vec4(position, 1.0));
  gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.0);

}
