#version 300 es
// normal map
precision highp float;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 bitangent;


out vec3 FragPos;
out vec2 vTexCoord;
out vec3 TangentLightPos;
out vec3 TangentViewPos;
out vec3 TangentFragPos;


uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 mMatrix;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main() {
  FragPos = vec3(mMatrix * vec4(position, 1.));
  vTexCoord = texCoord;

  mat3 normalMatrix = transpose(inverse(mat3(mMatrix)));
  vec3 T = normalize(normalMatrix * tangent);
  vec3 N = normalize(normalMatrix * normal);
  T = normalize(T - dot(T, N) * N);
  vec3 B = cross(N, T);

  mat3 TBN = transpose(mat3(T, B, N));
  TangentLightPos = TBN * lightPos;
  TangentViewPos  = TBN * viewPos;
  TangentFragPos  = TBN * FragPos;

  gl_Position = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.0);
}
