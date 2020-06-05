#version 300 es
precision highp float;
out vec4 FragColor;

//rectangle area light

vec3 projectOnPlane(in vec3 p, in vec3 pc, in vec3 pn)
{
    float distance = dot(pn, p-pc);
    return p - distance*pn;
}
int sideOfPlane(in vec3 p, in vec3 pc, in vec3 pn){
   if (dot(p-pc,pn)>=0.0) return 1; else return 0;
}
vec3 linePlaneIntersect(in vec3 lp, in vec3 lv, in vec3 pc, in vec3 pn){
   return lp+lv*(dot(pn,pc-lp)/dot(pn,lv));
}
void areaLight(in int i, in vec3 N, in vec3 V, in float shininess,
                inout vec4 ambient, inout vec4 diffuse, inout vec4 specular)
{
    vec3 right = normalize(vec3(gl_ModelViewMatrix*gl_LightSource.ambient));
    vec3 pnormal = normalize(gl_LightSource.spotDirection);
    vec3 up = normalize(cross(right,pnormal));

    //width and height of the area light:
    float width = 1.0; 
    float height = 4.0;

    //project onto plane and calculate direction from center to the projection.
    vec3 projection = projectOnPlane(V,vec3(gl_LightSource.position.xyz),pnormal);// projection in plane
    vec3 dir = projection-vec3(gl_LightSource.position.xyz);

    //calculate distance from area:
    vec2 diagonal = vec2(dot(dir,right),dot(dir,up));
    vec2 nearest2D = vec2(clamp( diagonal.x,-width,width  ),clamp(  diagonal.y,-height,height));
    vec3 nearestPointInside = vec3(gl_LightSource.position.xyz)+(right*nearest2D.x+up*nearest2D.y);

    float dist = distance(V,nearestPointInside);//real distance to area rectangle

    vec3 L = normalize(nearestPointInside - V);
    float attenuation = calculateAttenuation(i, dist);

    float nDotL = dot(pnormal,-L);

    if (nDotL > 0.0 && sideOfPlane(V,vec3(gl_LightSource.position.xyz),pnormal) == 1) //looking at the plane
    {   
        //shoot a ray to calculate specular:
        vec3 R = reflect(normalize(-V), N);
        vec3 E = linePlaneIntersect(V,R,vec3(gl_LightSource.position.xyz),pnormal);

        float specAngle = dot(R,pnormal);
        if (specAngle > 0.0){
	    vec3 dirSpec = E-vec3(gl_LightSource.position.xyz);
    	    vec2 dirSpec2D = vec2(dot(dirSpec,right),dot(dirSpec,up));
          vec2 nearestSpec2D = vec2(clamp( dirSpec2D.x,-width,width  ),clamp(  dirSpec2D.y,-height,height));
    	    float specFactor = 1.0-clamp(length(nearestSpec2D-dirSpec2D)*shininess,0.0,1.0);
          specular += gl_LightSource.specular * attenuation * specFactor * specAngle;   
        }
        diffuse  += gl_LightSource.diffuse  * attenuation * nDotL;  
    }
   
    ambient  += gl_LightSource.ambient * attenuation;
}
