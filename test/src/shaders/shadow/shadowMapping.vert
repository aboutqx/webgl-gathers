#version 300 es
//shadow
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;


out vec3 vPosition;
out  vec3 Normal;
out  vec2 vTexCoord;
out vec4 FragPosLightSpace;


uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 mMatrix;
uniform mat4 lightSpaceMatrix;

void main(){
  gl_Position = uProjectionMatrix * uViewMatrix * mMatrix * vec4(position, 1.);
  vPosition = vec3(mMatrix * vec4(position, 1.));
  Normal = transpose(inverse(mat3(mMatrix))) * normal;
  vTexCoord = texCoord;
  FragPosLightSpace = lightSpaceMatrix * vec4(vPosition, 1.); // 从lightPos视角看的坐标
}
