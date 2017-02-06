float4 reflectPS(vertexOutput IN,
                 uniform samplerCUBE EnvMap,
                 uniform sampler2D NormalMap,
                 uniform float4 SurfColor,
                 uniform float Kr, // intensity of reflection
                 
   uniform float KrMin, // typical: 0.05 * Kr
                 
   uniform float FresExp, // typical: 5.0
                 
   uniform float Bumpiness // amount of bump
                 ) : COLOR
{
  float3 Nu = normalize(IN.LightingNormal);
  // for bump mapping, we will alter "Nu" to get "Nb"
  
   float3 Tu = normalize(IN.LightingTangent);
  float3 Bu = normalize(IN.LightingBinorm);
  float3 bumps = Bumpiness *
                   (tex2D(NormalMap, IN.TexCoord.xy).xyz - (0.5).xxx);
  float3 Nb = Nu + (bumps.x * Tu + bumps.y * Bu);
  Nb = normalize(Nb); // expressed in user-coord space
  
   float3 Vu = normalize(IN.LightingEyeVec);
  float vdn = dot(Vu, Nb); // or "Nu" if unbumped - see text
  
   // "fres" attenuates the strength of the reflection
  
   // according to Fresnel's law
  
   float fres = KrMin + (Kr - KrMin) * pow((1.0 - abs(vdn)), FresExp);
  float3 reflVect = normalize(reflect(Vu, Nb)); // yes, normalize
  
   // now we intersect "reflVect" with a sphere of radius 1.0
  
   float b = -2.0 * dot(reflVect, IN.LightingPos);
  float c = dot(IN.LightingPos, IN.LightingPos) - 1.0;
  float discrim = b * b - 4.0 * c;
  bool hasIntersects = false;
  float4 reflColor = float4(1, 0, 0, 0);
  if (discrim > 0) {
    // pick a small error value very close to zero as "epsilon"
    hasIntersects = ((abs(sqrt(discrim) - b) / 2.0) > 0.00001);
  }
  if (hasIntersects) {
    // determine where on the unit sphere reflVect intersects
    reflVect = nearT * reflVect - IN.LightingPos;
    // reflVect.y = -reflVect.y; // optional - see text
    
   // now use the new intersection location as the 3D direction
    reflColor = fres * texCUBE(EnvMap, reflVect);
  }
  float4 result = SurfColor * reflColor;
  return result;
}
