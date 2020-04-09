#version 300 es
precision mediump float;
out vec4 FragColor;

in vec3 FragPos;
in vec2 vTexCoord;
in vec3 TangentLightPos;
in vec3 TangentViewPos;
in vec3 TangentFragPos;


uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D heightMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

uniform float heightScale;

vec2 textureOffset(vec2 vTexCoord, vec3 viewDir)
{ 
    float height =  texture(heightMap, vTexCoord).r;    
    vec2 p = viewDir.xy / viewDir.z * (height * heightScale);
    return vTexCoord - p;    
} 

void main()
{
    

    vec3 viewDir = normalize(TangentViewPos - TangentFragPos);
    vec2 vTexCoord = textureOffset(vTexCoord,  viewDir);
    if(vTexCoord.x > 1.0 || vTexCoord.y > 1.0 || vTexCoord.x < 0.0 || vTexCoord.y < 0.0)
    discard;

     // obtain normal from normal map in range [0,1]
    vec3 normal = texture(normalMap, vTexCoord).rgb;
    // transform normal vector to range [-1,1]
    normal = normalize(normal * 2.0 - 1.0);  // this normal is in tangent space

    // get diffuse color
    vec3 color = texture(diffuseMap, vTexCoord).rgb;
    // ambient
    vec3 ambient = 0.1 * color;
    // diffuse
    vec3 lightDir = normalize(TangentLightPos - TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;
    // specular
    

    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    vec3 specular = vec3(0.2) * spec;
    FragColor = vec4(ambient + diffuse + specular, 1.0);
}
