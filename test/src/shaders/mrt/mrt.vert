attribute vec3  position;
attribute vec3  normal;
attribute vec4  color;
uniform   mat4  mvpMatrix;
uniform   mat4  invMatrix;
uniform   vec3  lightDirection;
uniform   vec4  ambient;
varying   vec4  vDest;
varying   vec4  vColor;
varying   vec3  vNormal;
varying   float vDepth;

void main(){
    gl_Position = mvpMatrix * vec4(position, 1.0);
    vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float diff = clamp(dot(normal, invLight), 0.1, 1.0);
    vDest = vec4(color.rgb * ambient.rgb * diff, 1.0);
    vColor = color * ambient;
    vNormal = normal;
    vDepth = gl_Position.z / gl_Position.w;
}
