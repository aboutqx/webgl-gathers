#version 300 es
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;
layout (location = 3) in mat4 instanceMatrix;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 Normal;
out vec2 vTexCoord;
out vec3 FragPos;
void main()
{
  Normal = mat3(transpose(inverse(instanceMatrix))) * normal; // 法线矩阵 修复不等比缩放
  vTexCoord = texCoord;
  FragPos = vec3(instanceMatrix * vec4(position, 1.0));
  gl_Position = uProjectionMatrix * uViewMatrix * instanceMatrix * vec4(position, 1.0);

}
