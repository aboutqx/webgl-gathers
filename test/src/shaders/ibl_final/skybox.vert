#version 300 es
in vec3 position;
uniform   mat4 mMatrix;
uniform   mat4 uViewMatrix;
uniform   mat4 uProjectionMatrix;

out vec3 WorldPos;

void main()
{
  mat4 rotView = mat4(mat3(uViewMatrix)); // remove translation from the view matrix
  vec4 pos       = mMatrix * vec4(position, 1.0);
	vec4 clipPos    = uProjectionMatrix * rotView * pos;
	gl_Position = clipPos.xyww; // 设置深度测试的z为1，这样只会在没有遮挡时渲染skybox，节省性能

  WorldPos = pos.xyz;
}
