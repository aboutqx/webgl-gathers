#version 300 es
precision highp float;
out vec4 FragColor;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D emission;
    float shininess;
};

struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};

in vec3 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;

uniform vec3 camPos;
uniform Material material;
uniform Light light;
uniform float uTime;

void main()
{
    // ambient
    vec3 ambient = light.ambient * texture(material.diffuse, vTexCoord).rgb;

    // diffuse
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(light.position - vPosition);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, vTexCoord).rgb;

    // specular
    vec3 viewDir = normalize(camPos - vPosition);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * texture(material.specular, vTexCoord).rgb;

    // attenuation
    float distance    = length(light.position - vPosition);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    ambient  *= attenuation;
    diffuse   *= attenuation;
    specular *= attenuation;

    vec3 emission = texture(material.emission, vTexCoord).rgb * vec3(.3,.3,7.) * .6;
    emission = emission * (sin(uTime/180.) * 0.5 + 0.5) * 2.0;   
    vec3 result = ambient + diffuse + specular + emission;
    FragColor = vec4(result, 1.0);
}
