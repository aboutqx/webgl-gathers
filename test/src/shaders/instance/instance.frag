#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 vNormal;

in vec3 vPosition;

uniform vec3 objectColor;


void main()
{   
    vec3 normal = normalize(vNormal);
    vec3 unsigedNormal = vec3(.5) + normal / 2.;
    // if(unsigedNormal.x < .5 || unsigedNormal.y < .0 || unsigedNormal.z < .0) {
    //     FragColor = vec4(0.3, 0.0, 0.0, 1.0);
    // } else {
    //     FragColor = vec4(0., 0., 0., 1.0);
    // }
    FragColor = vec4( unsigedNormal, 1.);
    FragColor = vec4( objectColor, 1.);
}
