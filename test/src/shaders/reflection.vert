// 漫射光diffuse不考虑视线
// 通过取光和眼睛的半矢量和normal的内积来确定反射光的强度
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
uniform   mat4 mvpMatrix;
varying   vec3 vNormal;
varying   vec4 vColor;

void main(void){
    vNormal     = normal;
    vColor      = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
