#version 300 es

precision highp float;

in vec3 vNormal;
in vec2 vTexCoord;
out vec4 FragColor;
uniform vec3 diffuseColor;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform vec3 uCameraPos;
uniform sampler2D aoMap;
uniform bool useAo;
in vec3 positionEye;

void main(void){
    vec3  invLight  = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3  invEye    = normalize(invMatrix * vec4(uCameraPos, 0.0)).xyz;
    vec3  halfLE    = normalize(invLight + invEye);
    float diffuse   = clamp(dot(vNormal, invLight), 0.0, 1.0);
    float specular  = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 8.0);

    float ao = texture(aoMap, vTexCoord).r;
    vec3  destColor = diffuseColor * diffuse + .3 * vec3(specular);
    if(useAo) destColor += ao * diffuseColor * .08 ;
    FragColor    = vec4(destColor, 1.);
    FragColor    = vec4(uCameraPos, 1.);
}
