#version 300 es
in vec3 position;
in vec2 texCoord;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
out   vec2 vTexCoord;
out vec3 Pos;
void main(void){
    vTexCoord = texCoord;
    Pos = position;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
}
