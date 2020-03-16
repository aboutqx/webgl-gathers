#version 300 es
// 漫射光diffuse不考虑视线
// 通过取光和眼睛的半矢量和normal的内积来确定反射光的强度
in vec3 position;
in vec3 normal;
in vec2 texCoord;
uniform mat4 mMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
out   vec3 vNormal;
out vec2 vTexCoord;

void main(void){
    vNormal     = normal;
    vTexCoord = texCoord;
    gl_Position = uProjectionMatrix* uViewMatrix * mMatrix * vec4(position, 1.0);
}
