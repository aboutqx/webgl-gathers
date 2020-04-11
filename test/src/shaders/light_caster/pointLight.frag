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

in vec3 FragPos;
in vec3 Normal;
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
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, vTexCoord).rgb;

    // specular
    vec3 viewDir = normalize(camPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * texture(material.specular, vTexCoord).rgb;

    // attenuation
    float distance    = length(light.position - FragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    ambient  *= attenuation;
    diffuse   *= attenuation;
    specular *= attenuation;

    vec3 emission = texture(material.emission, vTexCoord).rgb * vec3(.3,.3,7.) * .6;
    emission = emission * (sin(uTime) * 0.5 + 0.5) * 2.0;   
    vec3 result = ambient + diffuse + specular + emission;
    FragColor = vec4(result, 1.0);
}
