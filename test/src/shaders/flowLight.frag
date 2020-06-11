#version 300 es
precision highp float;
in vec3 vPosition;
uniform float flowIndex[8];


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
    float p;
    float size = 40.;
    for(int i = 0; i < flowIndex.length() ; i++) {
        if(abs(flowIndex[i] - vIndex) < size) {
            p =  smoothstep(0., 1.5, (vIndex - flowIndex[0]) / (2. * size + flowIndex[flowIndex.length() - 1] - flowIndex[0]));
            break;
        } else {
            p = 0.;
        }
    }
    
    finalColor += (caculColor * p) * 1.5 ;


    FragColor = vec4(finalColor, 1.0);
}
