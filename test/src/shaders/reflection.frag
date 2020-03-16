#version 300 es

precision mediump float;

in vec3 vNormal;
in vec2 vTexCoord;
out vec4 FragColor;
uniform vec3 diffuseColor;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 uCameraPos;
uniform sampler2D aoMap;
uniform vec3 ambientColor;
uniform bool useAo;

void main(void){
    vec3  invLight  = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3  invEye    = normalize(invMatrix * vec4(uCameraPos, 0.0)).xyz;
    vec3  halfLE    = normalize(invLight + invEye);
    float diffuse   = clamp(dot(vNormal, invLight), 0.0, 1.0);
    float specular  = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 8.0);

    float ao = texture(aoMap, vTexCoord).r;
    vec4  destColor = vec4(diffuseColor, 1.) * vec4(vec3(diffuse), 1.0) + .3 * vec4(vec3(specular), 1.0);
    if(useAo) destColor += ao * vec4(diffuseColor, 1.) * .08 ;
    FragColor    = destColor;
}
