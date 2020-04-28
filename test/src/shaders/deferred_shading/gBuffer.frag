#version 300 es
precision highp float;
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec2 vTexCoord;
in vec3 vPosition;
in vec3 Normal;

uniform sampler2D diffuseMap1;
uniform sampler2D specularMap1;

void main()
{
    // store the fragment position vector in the first gbuffer texture
    gPosition = vPosition;
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(Normal);
    // and the diffuse per-fragment color
    gAlbedoSpec.rgb = texture(diffuseMap1, vTexCoord).rgb;
    // store specular intensity in gAlbedoSpec's alpha component
    gAlbedoSpec.a = texture(specularMap1, vTexCoord).r;
}
