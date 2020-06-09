#version 300 es
precision highp float;
in vec3 vPosition;
uniform vec3 flowPos;
uniform vec3 flowDirection;

out vec4 FragColor;
uniform vec3 color;
uniform vec3 flowColor;
uniform float flowLength;

bool almostEqual(vec3 a , vec3 b) {
    if(abs(a[0] - b[0]) <.001 &&  abs(a[1] - b[1]) <.001 && abs(a[1] - b[1]) <.001){
        return true;
    }
    return false;
}

void main()
{   
    vec3 caculColor = flowColor;
    vec3 finalColor = color;
    vec3 sub = vPosition - flowPos;
    if(almostEqual(flowDirection, normalize(sub))) {
        caculColor *= length(sub);
        if(length(sub) > flowLength) {
            caculColor *= 0.;
        }
        if(sub[0] < 0. || sub[1] < 0. || sub[2] < 0.) {
            caculColor *= 0.;
        }
        finalColor += caculColor * 1.5;
    }
    
    FragColor = vec4(finalColor, 1.0);
}
