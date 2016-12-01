#define GLSLIFY 1
uniform vec2 uMouse;
varying vec3 vPosition;
varying vec3 vReflect;
varying vec2 vUV;
varying float intensity;
varying float vAlpha;
uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;
varying float vReflectionFactor;
void main() {  
    vUV = uv;  
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );  
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );  
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );  
    //从camera到物体表面的向量
    vec3 I = worldPosition.xyz - cameraPosition;
    //fresnel,http://kylehalladay.com/blog/tutorial/2014/02/18/Fresnel-Shaders-From-The-Ground-Up.html  
    vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );  
    vec4 mPosition = modelMatrix * vec4( position, 1.0 );  
    vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );  
    //使用了与正常反射相反的向量，从而使用反射的贴图作为纹理
    I = cameraPosition - mPosition.xyz;  vReflect = normalize( reflect( I, nWorld ) );  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );  
    worldPosition = modelMatrix * vec4(position, 1.0);  
    float distFromMouse = distance( uMouse, gl_Position.xy / gl_Position.w );  
    vAlpha = ( ( 1.0 - ( distFromMouse * 4.0 ) ) * 0.5 ) + .5;  
    vAlpha = clamp( vAlpha, 0.0, 1.0 );  
    vPosition = gl_Position.xyz / gl_Position.w ;
}


#define GLSLIFY 1
uniform vec2 uResolution;
uniform float uGlobalAlpha;varying vec3 vPosition; 
//uniform float uIsDebug; varying float vAlpha;
//void main() {   
//    vec2 normCoord = gl_FragCoord.xy / uResolution; 
//    vec4 color = vec4( vec3( 0.0, 0.0, 0.0 ), vAlpha );  
//    if ( uIsDebug == 0.0 ) {     
//    color = vec4( vec3( 0.0, 0.0, 0.0 ), vAlpha );
//    }   else {     
//        color = vec4( 1.0, 0.0, 0.0, 1.0 );     
//    } 
//    gl_FragColor = color; 
//}  
uniform sampler2D tDiffuse;varying vec3 vReflect;
varying float intensity;varying float vAlpha;
varying float vReflectionFactor;varying vec2 vUV;
void main(void) { 
    float PI = 3.14159265358979323846264;  
    //将球面坐标转换为平面坐标
    float yaw = .5 + atan( vReflect.z, vReflect.x ) / ( 2.0 * PI );
    float pitch = .5 + atan( vReflect.y, length( vReflect.xz ) ) / ( PI ); 
    vec3 color = texture2D( tDiffuse, vec2( yaw, pitch ) ).rgb;  
    vec2 normCoord = gl_FragCoord.xy / uResolution;
    vec4 gradientColor = vec4( vec3( vPosition.xy * 0.5 + 0.5, 1.0 ) , 1.0 );
    vec4 restColor = vec4( vec3( 0.40 ), 1.0 ); 
    //light color
    vec4 mixColor = mix( gradientColor, restColor, 1.0 - vAlpha );
    vec3 reflectionColor = color * ( vReflectionFactor - 0.1 );
    //Specular reflection,multiply means shading reflection,like mask
    vec3 metalReflectionColor = (reflectionColor * mixColor.xyz) / 0.2;
    //Difuss reflection,add means change brightness
    vec3 flatReflectionColor = (reflectionColor + mixColor.xyz) / 0.2; 
    vec3 mixedReflection = mix( metalReflectionColor, flatReflectionColor, 0.3 ); 
    vec3 final = mixedReflection;  
    gl_FragColor = vec4( vec3( vAlpha * mixedReflection * 1.0 ) + ( metalReflectionColor * 0.3 ) , 0.85 * uGlobalAlpha );
}
