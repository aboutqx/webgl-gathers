attribute vec3 position;
attribute vec2 texcoord;
uniform   mat4 mvpMatrix;
varying   vec2 vTexCoord;


void main(void){
    vTexCoord = texcoord;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
