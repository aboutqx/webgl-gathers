#version 300 es
// 漫射光diffuse不考虑视线
// 通过取光和眼睛的半矢量和normal的内积来确定反射光的强度
in vec3 position;
in vec3 normal;
in vec4 color;
uniform   mat4 mvpMatrix;
out   vec3 vNormal;
out   vec4 vColor;

void main(void){
    vNormal     = normal;
    vColor      = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
