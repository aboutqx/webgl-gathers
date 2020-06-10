#version 300 es
precision highp float;
in vec3 vPosition;
uniform float flowIndex[6];


out vec4 FragColor;
uniform vec3 color;
uniform vec3 flowColor;
in float vIndex;
bool almostEqual(vec3 a , vec3 b) {
    if(abs(a[0] - b[0]) <.001 &&  abs(a[1] - b[1]) <.001 && abs(a[2] - b[2]) <.001){
        return true;
    }
    return false;
}

void main()
{   
    vec3 caculColor = flowColor;
    vec3 finalColor = color;
    for(int i = 0; i < 6; i++) {
        if(abs(flowIndex[i] - vIndex) < 100.) {
            caculColor *= 1.;
            break;
        } else {
            caculColor = vec3(0.);
        }
    }
    finalColor *= (caculColor * (vIndex - flowIndex[0]) / (flowIndex[5] - flowIndex[0]));

    finalColor += color;
    
    FragColor = vec4(finalColor, 1.0);
}
