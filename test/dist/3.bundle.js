(window.webpackJsonp=window.webpackJsonp||[]).push([[3,23],{10:function(e,t,n){"use strict";const o="#\\?RADIANCE",r="#.*",a="EXPOSURE=\\s*([0-9]*[.][0-9]*)",i="FORMAT=32-bit_rle_rgbe",s="-Y ([0-9]+) \\+X ([0-9]+)";t.a=function(e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));let t=0;const n=e.length,l=10;function d(){let o="";do{const n=e[t];if(n===l){++t;break}o+=String.fromCharCode(n)}while(++t<n);return o}let c=0,u=0,f=1,h=!1;for(let e=0;e<20;e++){const e=d();let t;if(t=e.match(o));else if(t=e.match(i))h=!0;else if(t=e.match(a))f=Number(t[1]);else if(t=e.match(r));else if(t=e.match(s)){u=Number(t[1]),c=Number(t[2]);break}}if(!h)throw new Error("File is not run length encoded!");const m=new Uint8Array(c*u*4);!function(e,t,n,o,r,a){const i=new Array(4);let s,l,d,c=null;const u=new Array(2),f=e.length;function h(t){let n=0;do{t[n++]=e[o]}while(++o<f&&n<t.length);return n}function m(t,n,r){let a=0;do{t[n+a++]=e[o]}while(++o<f&&a<r);return a}function p(e,t,n,o){const r=4*o,a=m(t,n,r);if(a<r)throw new Error(`Error reading raw pixels: got ${a} bytes, expected ${r}`)}for(;a>0;){if(h(i)<i.length)throw new Error(`Error reading bytes: expected ${i.length}`);if(2!==i[0]||2!==i[1]||0!=(128&i[2]))return t[n++]=i[0],t[n++]=i[1],t[n++]=i[2],t[n++]=i[3],void p(0,t,n,r*a-1);if(((255&i[2])<<8|255&i[3])!==r)throw new Error(`Wrong scanline width ${(255&i[2])<<8|255&i[3]}, expected ${r}`);null===c&&(c=new Array(4*r)),s=0;for(let e=0;e<4;e++)for(l=(e+1)*r;s<l;){if(h(u)<u.length)throw new Error("Error reading 2-byte buffer");if((255&u[0])>128){if(0==(d=(255&u[0])-128)||d>l-s)throw new Error("Bad scanline data");for(;d-- >0;)c[s++]=u[1]}else{if(0==(d=255&u[0])||d>l-s)throw new Error("Bad scanline data");if(c[s++]=u[1],--d>0){if(m(c,s,d)<d)throw new Error("Error reading non-run data");s+=d}}}for(let e=0;e<r;e++)t[n+0]=c[e],t[n+1]=c[e+r],t[n+2]=c[e+2*r],t[n+3]=c[e+3*r],n+=4;a--}}(e,m,0,t,c,u);const p=new Float32Array(c*u*4);for(let e=0;e<m.length;e+=4){let t=m[e+0]/255,n=m[e+1]/255,o=m[e+2]/255;const r=m[e+3],a=Math.pow(2,r-128);t*=a,n*=a,o*=a;const i=e;p[i+0]=t,p[i+1]=n,p[i+2]=o,p[i+3]=1}return{shape:[c,u],exposure:f,gamma:1,data:p}}},12:function(e,t){function n(e){if(this.gl=e,void 0!==e.bindVertexArray)this._impl=new o(this);else{var t=e.getExtension("OES_vertex_array_object");t?(!function(e,t){e.bindVertexArray=function(){return t.bindVertexArrayOES.apply(t,arguments)},e.createVertexArray=function(){return t.createVertexArrayOES.apply(t,arguments)},e.deleteVertexArray=function(){return t.deleteVertexArrayOES.apply(t,arguments)},e.isVertexArray=function(){return t.isVertexArrayOES.apply(t,arguments)}}(e,t),this._impl=new o(this)):this._impl=new r(this)}}function o(e){this._vao=e,this._handle=null}function r(e){this._vao=e}n.prototype={dispose:function(){this._impl.dispose(),this._impl=null},setup:function(e,t,n){e.ready||e._grabParameters(),this._impl.setup(e,t,n)},bind:function(){this._impl.bind()},unbind:function(){this._impl.unbind()}},o.prototype={dispose:function(){this.release(),this._vao=null},setup:function(e,t,n){this.release();var o=this._vao.gl;this._handle=o.createVertexArray(),o.bindVertexArray(this._handle);for(var r=0;r<t.length;r++)t[r].attribPointer(e);void 0!==n&&n.bind(),o.bindVertexArray(null)},bind:function(){this._vao.gl.bindVertexArray(this._handle)},unbind:function(){this._vao.gl.bindVertexArray(null)},release:function(){this._handle&&(this._vao.gl.deleteVertexArray(this._handle),this._handle=null)}},r.prototype={dispose:function(){this._vao=null,this.prg=null,this.buffers=null,this.indices=null},setup:function(e,t,n){this.prg=e,this.buffers=t,this.indices=n},bind:function(){for(var e=0;e<this.buffers.length;e++)this.buffers[e].attribPointer(this.prg);void 0!==this.indices&&this.indices.bind()},unbind:function(){}},e.exports=n},13:function(e,t,n){"use strict";var o=n(0),r=n(37),a=n.n(r);class i{constructor(e,t={},n=!1){if(n)return void(this.texture=e);let r=e.length>6;e[0].mipmapCount&&(r=e[0].mipmapCount>1),this.texture=o.d.createTexture(),this.magFilter=t.magFilter||o.d.LINEAR,this.minFilter=t.minFilter||o.d.LINEAR_MIPMAP_LINEAR,this.wrapS=t.wrapS||o.d.CLAMP_TO_EDGE,this.wrapT=t.wrapT||o.d.CLAMP_TO_EDGE,r||this.minFilter!=o.d.LINEAR_MIPMAP_LINEAR||(this.minFilter=o.d.LINEAR),o.d.bindTexture(o.d.TEXTURE_CUBE_MAP,this.texture);const a=[o.d.TEXTURE_CUBE_MAP_POSITIVE_X,o.d.TEXTURE_CUBE_MAP_NEGATIVE_X,o.d.TEXTURE_CUBE_MAP_POSITIVE_Y,o.d.TEXTURE_CUBE_MAP_NEGATIVE_Y,o.d.TEXTURE_CUBE_MAP_POSITIVE_Z,o.d.TEXTURE_CUBE_MAP_NEGATIVE_Z];let i=1,s=0;if(i=e.length/6,this.numLevels=i,r)for(let t=0;t<6;t++)for(let n=0;n<i;n++)o.d.pixelStorei(o.d.UNPACK_FLIP_Y_WEBGL,!1),e[s=t*i+n].shape?window.useWebgl2?o.d.texImage2D(a[t],n,o.d.RGBA16F,e[s].shape[0],e[s].shape[1],0,o.d.RGBA,o.d.FLOAT,e[s].data):o.d.texImage2D(a[t],n,o.d.RGBA,e[s].shape[0],e[s].shape[1],0,o.d.RGBA,o.d.FLOAT,e[s].data):o.d.texImage2D(a[t],n,o.d.RGBA,o.d.RGBA,o.d.UNSIGNED_BYTE,e[s]),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_WRAP_S,this.wrapS),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_WRAP_T,this.wrapT),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_MAG_FILTER,this.magFilter),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_MIN_FILTER,this.minFilter);else{let t=0;for(let n=0;n<6;n++)t=n*i,o.d.pixelStorei(o.d.UNPACK_FLIP_Y_WEBGL,!1),e[t].shape?window.useWebgl2?o.d.texImage2D(a[n],0,o.d.RGBA16F,e[t].shape[0],e[t].shape[1],0,o.d.RGBA,o.d.FLOAT,e[t].data):o.d.texImage2D(a[n],0,o.d.RGBA,e[t].shape[0],e[t].shape[1],0,o.d.RGBA,o.d.FLOAT,e[t].data):o.d.texImage2D(a[n],0,o.d.RGBA,o.d.RGBA,o.d.UNSIGNED_BYTE,e[t]),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_WRAP_S,this.wrapS),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_WRAP_T,this.wrapT),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_MAG_FILTER,this.magFilter),o.d.texParameteri(o.d.TEXTURE_CUBE_MAP,o.d.TEXTURE_MIN_FILTER,this.minFilter);o.d.generateMipmap(o.d.TEXTURE_CUBE_MAP)}o.d.bindTexture(o.d.TEXTURE_CUBE_MAP,null)}bind(e=0){o.d.activeTexture(o.d.TEXTURE0+e),o.d.bindTexture(o.d.TEXTURE_CUBE_MAP,this.texture),this._bindIndex=e}unbind(){o.d.bindTexture(o.d.TEXTURE_CUBE_MAP,null)}}i.parseDDS=function(e){const t=a()(e),{flags:n}=t;console.log("ddsInfos",t);const o=new Int32Array(e,0,31);let r=1;131072&n&&(r=Math.max(1,o[7]));const s=t.images.map(t=>{return{data:new Float32Array(e.slice(t.offset,t.offset+t.length)),shape:t.shape,mipmapCount:r}});return new i(s)},t.a=i},14:function(e,t){e.exports="#version 300 es\n#define GLSLIFY 1\nin vec3 position;\nin vec2 texCoord;\nuniform   mat4 mMatrix;\nuniform   mat4 vpMatrix;\n\nout vec3 WorldPos;\nout vec2 vUv;\nvoid main(void){\n  vec4 pos       = mMatrix * vec4(position, 1.0);\n\tgl_Position    = vpMatrix * pos;\n\n  WorldPos = pos.xyz;\n  vUv = texCoord;\n}\n"},16:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform sampler2D equirectangularMap;\nin vec3 WorldPos;\nin vec2 vUv;\nout vec4 outColor;\n\nconst vec2 invAtan = vec2(0.1591, 0.3183);\nvec2 SampleSphericalMap(vec3 v)\n{\n    vec2 uv = vec2(atan(v.z, v.x), asin(v.y)); // [-PI/2,PI/2]\n    uv *= invAtan; //[-.5,.5]\n    uv += 0.5;\n    return uv;\n}\n\nvoid main()\n{\n    vec2 uv = SampleSphericalMap(normalize(WorldPos));\n    vec3 color = textureLod(equirectangularMap, uv, 0.).rgb;\n\n    outColor = vec4(color, 1.0);\n    // gl_FragColor = vec4(WorldPos,1.);\n}\n"},17:function(e,t){e.exports="#version 300 es\n#define GLSLIFY 1\nin vec3 position;\nuniform   mat4 mMatrix;\nuniform   mat4 vMatrix;\nuniform   mat4 pMatrix;\n\nout vec3 WorldPos;\n\nvoid main()\n{\n  mat4 rotView = mat4(mat3(vMatrix)); // remove translation from the view matrix\n  vec4 pos       = mMatrix * vec4(position, 1.0);\n\tvec4 clipPos    = pMatrix * rotView * pos;\n\tgl_Position = clipPos.xyww; // 设置深度测试的z为1，这样只会在没有遮挡时渲染skybox，节省性能\n\n  WorldPos = pos.xyz;\n}\n"},18:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform samplerCube environmentMap;\nin vec3 WorldPos;\nout vec4 outColor;\nvoid main()\n{\n    vec3 envColor = textureLod(environmentMap, WorldPos, 0.).rgb;\n\n    // HDR tonemap and gamma correct\n    envColor = envColor / (envColor + vec3(1.0));\n    envColor = pow(envColor, vec3(1.0/2.2));\n\n    outColor = vec4(envColor, 1.0);\n}\n"},19:function(e,t){e.exports="#version 300 es\n#define GLSLIFY 1\n\nin vec3 position;\nin vec2 texCoord;\nout vec2 TexCoords;\n\nvoid main(void) {\n  gl_Position = vec4(position, 1.);\n  TexCoords = texCoord;\n\n}\n"},20:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec2 FragColor;\nin vec2 TexCoords;\n\nconst float PI = 3.14159265359;\n// ----------------------------------------------------------------------------\n// http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html\n// efficient VanDerCorpus calculation.\nfloat RadicalInverse_VdC(uint bits)\n{\n     bits = (bits << 16u) | (bits >> 16u);\n     bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);\n     bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);\n     bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);\n     bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);\n     return float(bits) * 2.3283064365386963e-10; // / 0x100000000\n}\n// ----------------------------------------------------------------------------\nvec2 Hammersley(uint i, uint N)\n{\n\treturn vec2(float(i)/float(N), RadicalInverse_VdC(i));\n}\n// ----------------------------------------------------------------------------\nvec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness)\n{\n\tfloat a = roughness*roughness;\n\n\tfloat phi = 2.0 * PI * Xi.x;\n\tfloat cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));\n\tfloat sinTheta = sqrt(1.0 - cosTheta*cosTheta);\n\n\t// from spherical coordinates to cartesian coordinates - halfway vector\n\tvec3 H;\n\tH.x = cos(phi) * sinTheta;\n\tH.y = sin(phi) * sinTheta;\n\tH.z = cosTheta;\n\n\t// from tangent-space H vector to world-space sample vector\n\tvec3 up          = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);\n\tvec3 tangent   = normalize(cross(up, N));\n\tvec3 bitangent = cross(N, tangent);\n\n\tvec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;\n\treturn normalize(sampleVec);\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySchlickGGX(float NdotV, float roughness)\n{\n    // note that we use a different k for IBL\n    float a = roughness;\n    float k = (a * a) / 2.0;\n\n    float nom   = NdotV;\n    float denom = NdotV * (1.0 - k) + k;\n\n    return nom / denom;\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)\n{\n    float NdotV = max(dot(N, V), 0.0);\n    float NdotL = max(dot(N, L), 0.0);\n    float ggx2 = GeometrySchlickGGX(NdotV, roughness);\n    float ggx1 = GeometrySchlickGGX(NdotL, roughness);\n\n    return ggx1 * ggx2;\n}\n// ----------------------------------------------------------------------------\nvec2 IntegrateBRDF(float NdotV, float roughness)\n{\n    vec3 V;\n    V.x = sqrt(1.0 - NdotV*NdotV);\n    V.y = 0.0;\n    V.z = NdotV;\n\n    float A = 0.0;\n    float B = 0.0;\n\n    vec3 N = vec3(0.0, 0.0, 1.0);\n\n    const uint SAMPLE_COUNT = 1024u;\n    for(uint i = 0u; i < SAMPLE_COUNT; ++i)\n    {\n        // generates a sample vector that's biased towards the\n        // preferred alignment direction (importance sampling).\n        vec2 Xi = Hammersley(i, SAMPLE_COUNT);\n        vec3 H = ImportanceSampleGGX(Xi, N, roughness);\n        vec3 L = normalize(2.0 * dot(V, H) * H - V);\n\n        float NdotL = max(L.z, 0.0);\n        float NdotH = max(H.z, 0.0);\n        float VdotH = max(dot(V, H), 0.0);\n\n        if(NdotL > 0.0)\n        {\n            float G = GeometrySmith(N, V, L, roughness);\n            float G_Vis = (G * VdotH) / (NdotH * NdotV);\n            float Fc = pow(1.0 - VdotH, 5.0);\n\n            A += (1.0 - Fc) * G_Vis;\n            B += Fc * G_Vis;\n        }\n    }\n    A /= float(SAMPLE_COUNT);\n    B /= float(SAMPLE_COUNT);\n    return vec2(A, B);\n}\n// ----------------------------------------------------------------------------\nvoid main()\n{\n    vec2 integratedBRDF = IntegrateBRDF(TexCoords.x, TexCoords.y);\n    FragColor = integratedBRDF;\n    // FragColor = vec4(integratedBRDF,0. ,1.);\n}\n"},37:function(e,t){var n=542327876,o=131072,r=4,a=N("DXT1"),i=N("DXT3"),s=N("DXT5"),l=N("DX10"),d=116,c=512,u=3,f=2,h=31,m=0,p=1,v=2,g=3,x=4,T=7,E=20,b=21,_=28;function N(e){return e.charCodeAt(0)+(e.charCodeAt(1)<<8)+(e.charCodeAt(2)<<16)+(e.charCodeAt(3)<<24)}e.exports=function(e){var t,N,F=new Int32Array(e,0,h);if(F[m]!==n)throw new Error("Invalid magic number in DDS header");if(!F[E]&r)throw new Error("Unsupported format, must contain a FourCC code");var A=F[b];switch(A){case a:t=8,N="dxt1";break;case i:t=16,N="dxt3";break;case s:t=16,N="dxt5";break;case d:N="rgba32f";break;case l:var M=new Uint32Array(e.slice(128,148));N=M[0];var R=M[1];M[2],M[3],M[4];if(R!==u||N!==f)throw new Error("Unsupported DX10 texture format "+N);N="rgba32f";break;default:throw new Error("Unsupported FourCC code: "+function(e){return String.fromCharCode(255&e,e>>8&255,e>>16&255,e>>24&255)}(A))}var P=F[v],L=1;P&o&&(L=Math.max(1,F[T]));var C=!1;F[_]&c&&(C=!0);var U,V=F[x],y=F[g],w=F[p]+4,D=V,B=y,I=[];A===l&&(w+=20);if(C)for(var G=0;G<6;G++){if("rgba32f"!==N)throw new Error("Only RGBA32f cubemaps are supported");V=D,y=B;for(var S=Math.log(V)/Math.log(2)+1,X=0;X<S;X++)U=V*y*16,I.push({offset:w,length:U,shape:[V,y]}),X<L&&(w+=U),V=Math.floor(V/2),y=Math.floor(y/2)}else for(var X=0;X<L;X++)U=Math.max(4,V)/4*Math.max(4,y)/4*t,I.push({offset:w,length:U,shape:[V,y]}),w+=U,V=Math.floor(V/2),y=Math.floor(y/2);return{shape:[D,B],images:I,format:N,flags:P,cubemap:C}}},49:function(e,t,n){"use strict";n.r(t),n.d(t,"default",function(){return X});var o=n(8),r=n(2),a=n(5),i=n(0),s=n(89),l=n.n(s),d=n(90),c=n.n(d),u=n(91),f=n.n(u),h=n(92),m=n.n(h),p=n(14),v=n.n(p),g=n(16),x=n.n(g),T=n(17),E=n.n(T),b=n(18),_=n.n(b),N=n(19),F=n.n(N),A=n(20),M=n.n(A),R=n(7),P=n(12),L=n.n(P),C=n(6),U=n(1),V=n(4),y=n(3),w=n.n(y),D=n(10),B=n(13);const I=7,G=7,S=.42;class X extends a.default{constructor(){super(),Object(r.a)(this,"count",0)}init(){i.d.getExtension("OES_texture_float_linear"),i.d.getExtension("EXT_color_buffer_float"),this.prg=this.compile(l.a,c.a),this.mapPrg=this.compile(f.a,m.a),this.cubePrg=this.compile(v.a,x.a),this.skyboxPrg=this.compile(E.a,_.a),this.brdfPrg=this.compile(F.a,M.a)}attrib(){let{pos:e,index:t,normal:n,uv:o}=Object(C.Sphere)(256,256,.15),r=new V.a;r.bufferVertex(e),r.bufferIndices(t),r.bufferNormal(n),r.bufferTexCoord(o),this.sphere=r;let a=new V.a;a.bufferData(C.CubeData,["position","normal","texCoord"],[3,3,2]),this.cube=a;this.planeBuffer=new R.a(i.d,new Float32Array([3,-.5,3,1,0,-3,-.5,3,0,0,-3,-.5,-3,0,1,3,-.5,3,1,0,-3,-.5,-3,0,1,3,-.5,-3,1,1])),this.planeBuffer.attrib("position",3,i.d.FLOAT),this.planeBuffer.attrib("texCoord",2,i.d.FLOAT),this.planeVao=new L.a(i.d),this.planeVao.setup(this.cubePrg,[this.planeBuffer]);let s=new V.a;s.bufferData([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0],["position","texCoord"],[3,2]),this.quad=s}prepare(){i.d.enable(i.d.DEPTH_TEST),i.d.depthFunc(i.d.LEQUAL),i.d.pixelStorei(i.d.UNPACK_FLIP_Y_WEBGL,!0);let e=U.a.identity(U.a.create()),t=U.a.identity(U.a.create()),n=U.a.identity(U.a.create()),o=U.a.identity(U.a.create());U.a.perspective(e,Object(i.e)(90),1,.1,100);const r=[[U.d.fromValues(0,0,0),U.d.fromValues(1,0,0),U.d.fromValues(0,-1,0)],[U.d.fromValues(0,0,0),U.d.fromValues(-1,0,0),U.d.fromValues(0,-1,0)],[U.d.fromValues(0,0,0),U.d.fromValues(0,1,0),U.d.fromValues(0,0,1)],[U.d.fromValues(0,0,0),U.d.fromValues(0,-1,0),U.d.fromValues(0,0,-1)],[U.d.fromValues(0,0,0),U.d.fromValues(0,0,1),U.d.fromValues(0,-1,0)],[U.d.fromValues(0,0,0),U.d.fromValues(0,0,-1),U.d.fromValues(0,-1,0)]];let a=Object(D.a)(getAssets.equirectangular);console.log("hdrInfo",a),this.hdrTexture=new w.a(i.d),i.d.bindTexture(i.d.TEXTURE_2D,this.hdrTexture.id),i.d.texImage2D(i.d.TEXTURE_2D,0,i.d.RGBA32F,a.shape[0],a.shape[1],0,i.d.RGBA,i.d.FLOAT,a.data),this.hdrTexture.clamp();let s=i.d.createTexture();i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,s);for(var l=0;l<6;l++)i.d.texImage2D(i.d.TEXTURE_CUBE_MAP_POSITIVE_X+l,0,i.d.RGBA32F,512,512,0,i.d.RGBA,i.d.FLOAT,null);i.d.texParameteri(i.d.TEXTURE_CUBE_MAP,i.d.TEXTURE_WRAP_S,i.d.CLAMP_TO_EDGE),i.d.texParameteri(i.d.TEXTURE_CUBE_MAP,i.d.TEXTURE_WRAP_T,i.d.CLAMP_TO_EDGE),i.d.texParameteri(i.d.TEXTURE_CUBE_MAP,i.d.TEXTURE_MIN_FILTER,i.d.LINEAR_MIPMAP_LINEAR),i.d.texParameteri(i.d.TEXTURE_CUBE_MAP,i.d.TEXTURE_MAG_FILTER,i.d.LINEAR),this.cubemapTexture=s,this.cubePrg.use(),this.hdrTexture.bind(0),i.d.viewport(0,0,512,512);let d=i.d.createFramebuffer();i.d.bindFramebuffer(i.d.FRAMEBUFFER,d);for(let a=0;a<6;a++)U.a.lookAt(n,r[a][0],r[a][1],r[a][2]),U.a.multiply(o,e,n),this.cubePrg.style({equirectangularMap:0,vpMatrix:o,mMatrix:t}),i.d.framebufferTexture2D(i.d.FRAMEBUFFER,i.d.COLOR_ATTACHMENT0,i.d.TEXTURE_CUBE_MAP_POSITIVE_X+a,this.cubemapTexture,0),i.d.clear(i.d.COLOR_BUFFER_BIT|i.d.DEPTH_BUFFER_BIT),this.cube.bind(this.cubePrg,["position","texCoord"]),this.cube.draw();const c=i.d.checkFramebufferStatus(i.d.FRAMEBUFFER);c!=i.d.FRAMEBUFFER_COMPLETE&&console.log(`gl.checkFramebufferStatus() returned ${c.toString(16)}`),i.d.bindFramebuffer(i.d.FRAMEBUFFER,null),this.brdfLUTTexture=new w.a(i.d,i.d.RG).fromData(512,512,null,i.d.RG32F),this.brdfLUTTexture.bind(),this.brdfLUTTexture.clamp(),i.d.bindFramebuffer(i.d.FRAMEBUFFER,d),i.d.framebufferTexture2D(i.d.FRAMEBUFFER,i.d.COLOR_ATTACHMENT0,i.d.TEXTURE_2D,this.brdfLUTTexture.id,0),i.d.viewport(0,0,512,512),this.brdfPrg.use(),i.d.clear(i.d.COLOR_BUFFER_BIT|i.d.DEPTH_BUFFER_BIT),this.quad.bind(this.brdfPrg),this.quad.draw(i.d.TRIANGLE_STRIP),i.d.bindFramebuffer(i.d.FRAMEBUFFER,null);let u=Object(D.a)(getAssets.irradiancePosX),f=Object(D.a)(getAssets.irradianceNegX),h=Object(D.a)(getAssets.irradiancePosY),m=Object(D.a)(getAssets.irradianceNegY),p=Object(D.a)(getAssets.irradiancePosZ),v=Object(D.a)(getAssets.irradianceNegZ);this.irradianceMap=new B.a([u,f,h,m,p,v]),this.prefilterMap=B.a.parseDDS(getAssets.radiance)}uniform(){this.vMatrix=U.a.identity(U.a.create()),this.pMatrix=U.a.identity(U.a.create()),this.tmpMatrix=U.a.create();let e=[],t=[];U.d.transformQuat(e,[0,0,3],this.rotateQ),U.d.transformQuat(t,[0,1,0],this.rotateQ),this.eyeDirection=e,U.a.lookAt(this.vMatrix,e,[0,0,0],t),U.a.perspective(this.pMatrix,Object(i.e)(45),i.a.clientWidth/i.a.clientHeight,.1,100),U.a.multiply(this.tmpMatrix,this.pMatrix,this.vMatrix)}_setGUI(){this.addGUIParams({lambertDiffuse:!0,orenNayarDiffuse:!1,map:"none"});let e=this.gui.addFolder("diffuse model");e.add(this.params,"lambertDiffuse").listen().onChange(()=>{this.setChecked("lambertDiffuse")}),e.add(this.params,"orenNayarDiffuse").listen().onChange(()=>{this.setChecked("orenNayarDiffuse")}),e.open();let t=this.gui.addFolder("material map");t.add(this.params,"map",["none","plastic","wall","gold","grass","rusted_iron","wood"]).listen().onChange(()=>{this.setTexture()}),t.open()}setChecked(e){this.params.lambertDiffuse=!1,this.params.orenNayarDiffuse=!1,this.params[e]=!0}setTexture(){let e=this.params.map;"none"!==e&&(this.texture0=new w.a(i.d,i.d.RGBA).fromImage(getAssets[e+"Albedo"]),this.texture1=new w.a(i.d,i.d.RGBA).fromImage(getAssets[e+"Roughness"]),this.texture2=new w.a(i.d,i.d.RGBA).fromImage(getAssets[e+"Metallic"]),this.texture3=new w.a(i.d,i.d.RGBA).fromImage(getAssets[e+"Ao"]),this.texture4=new w.a(i.d,i.d.RGBA).fromImage(getAssets[e+"Normal"]))}render(){i.d.viewport(0,0,i.a.width,i.a.height),i.d.clearColor(.3,.3,.3,1),i.d.clearDepth(1),i.d.clear(i.d.COLOR_BUFFER_BIT|i.d.DEPTH_BUFFER_BIT);let e=U.a.identity(U.a.create()),t={vpMatrix:this.tmpMatrix,lightPositions:[-10,10,10,10,10,10,-10,-10,10,10,-10,10],lightColors:new Array(12).fill(300),camPos:this.eyeDirection,lambertDiffuse:this.params.lambertDiffuse};if("none"===this.params.map){this.prg.use(),i.d.activeTexture(i.d.TEXTURE0),i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,this.irradianceMap.texture),i.d.activeTexture(i.d.TEXTURE1),i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,this.prefilterMap.texture),i.d.activeTexture(i.d.TEXTURE2),i.d.bindTexture(i.d.TEXTURE_2D,this.brdfLUTTexture.id),this.prg.style(Object(o.a)({},t,{albedo:[.5,0,0],ao:1,irradianceMap:0,prefilterMap:1,brdfLUT:2})),this.sphere.bind(this.prg,["position","normal"]);for(let t=0;t<I;t++){this.prg.style({metallic:t/I});for(let n=0;n<G;n++)U.a.translate(e,U.a.create(),[(n-G/2)*S,(t-I/2)*S,0]),this.prg.style({roughness:k(n/G,.05,1),mMatrix:e}),this.sphere.draw()}}else this.mapPrg.use(),this.texture0.bind(0),this.texture1.bind(1),this.texture2.bind(2),this.texture3.bind(3),this.texture4.bind(4),i.d.activeTexture(i.d.TEXTURE5),i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,this.irradianceMap.texture),i.d.activeTexture(i.d.TEXTURE6),i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,this.prefilterMap.texture),i.d.activeTexture(i.d.TEXTURE7),i.d.bindTexture(i.d.TEXTURE_2D,this.brdfLUTTexture),U.a.scale(e,e,[2,2,2]),this.mapPrg.style(Object(o.a)({},t,{mMatrix:e,albedoMap:0,roughnessMap:1,metallicMap:2,aoMap:3,normalMap:4,irradianceMap:5,prefilterMap:6,brdfLUT:7})),this.sphere.bind(this.mapPrg),this.sphere.draw();this.skyboxPrg.use(),i.d.activeTexture(i.d.TEXTURE0),i.d.bindTexture(i.d.TEXTURE_CUBE_MAP,this.cubemapTexture),this.skyboxPrg.style({environmentMap:0,vMatrix:this.vMatrix,pMatrix:this.pMatrix,mMatrix:U.a.identity(U.a.create())}),this.cube.bind(this.skyboxPrg,["position"]),this.cube.draw()}}function k(e,t,n){return t>n?k(e,n,t):e<t?t:e>n?n:e}},6:function(e,t,n){"use strict";function o(e,t,n,o,a){let i,s=[],l=[],d=[],c=[];for(let l=0;l<=e;l++){let u=2*Math.PI/e*l,f=Math.cos(u),h=Math.sin(u);for(let e=0;e<=t;e++){let l=2*Math.PI/t*e,u=(f*n+o)*Math.cos(l),m=h*n,p=(f*n+o)*Math.sin(l);s.push(u,m,p),i=a||r(360/t*e,1,1,1),c.push(i[0],i[1],i[2],i[3]);let v=f*Math.cos(l),g=f*Math.sin(l);d.push(v,h,g)}}for(let n=0;n<e;n++)for(let e=0;e<t;e++){let o=(t+1)*n+e;l.push(o,o+t+1,o+1),l.push(o+t+1,o+t+2,o+1)}return{pos:s,index:l,normal:d,color:c}}function r(e,t,n,o){if(t>1||n>1||o>1)return;let r=e%360,a=Math.floor(r/60),i=r/60-a,s=n*(1-t),l=n*(1-t*i),d=n*(1-t*(1-i)),c=[];if(!t>0&&!t<0)c.push(n,n,n,o);else{let e=[n,l,s,s,d,n],t=[d,n,n,l,s,s],r=[s,s,d,n,n,l];c.push(e[a],t[a],r[a],o)}return c}function a(e,t,n,o){for(var a=[],i=[],s=[],l=[],d=[],c=0;c<=e;c++)for(var u=Math.PI/e*c,f=Math.cos(u),h=Math.sin(u),m=0;m<=t;m++){var p=2*Math.PI/t*m,v=h*n*Math.cos(p),g=f*n,x=h*n*Math.sin(p),T=h*Math.cos(p),E=h*Math.sin(p);if(o)var b=o;else b=r(360/e*c,1,1,1);a.push(v,g,x),i.push(T,f,E),s.push(b[0],b[1],b[2],b[3]),l.push(1-1/t*m,1/e*c)}for(u=0,c=0;c<e;c++)for(m=0;m<t;m++)u=(t+1)*c+m,d.push(u,u+1,u+t+2),d.push(u,u+t+2,u+t+1);return{pos:a,normal:i,color:s,uv:l,index:d}}function i(e,t,n){const o=e/2,r=n/2;return[o,t,r,0,1,0,1,0,-o,t,-r,0,1,0,0,1,-o,t,r,0,1,0,0,0,o,t,r,0,1,0,1,0,o,t,-r,0,1,0,1,1,-o,t,-r,0,1,0,0,1]}n.r(t),n.d(t,"Torus",function(){return o}),n.d(t,"hsva",function(){return r}),n.d(t,"Sphere",function(){return a}),n.d(t,"plane",function(){return i}),n.d(t,"QuadData",function(){return s}),n.d(t,"CubeData",function(){return l});const s=[-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0],l=[-1,-1,-1,0,0,-1,0,0,1,1,-1,0,0,-1,1,1,1,-1,-1,0,0,-1,1,0,1,1,-1,0,0,-1,1,1,-1,-1,-1,0,0,-1,0,0,-1,1,-1,0,0,-1,0,1,-1,-1,1,0,0,1,0,0,1,-1,1,0,0,1,1,0,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,-1,1,1,0,0,1,0,1,-1,-1,1,0,0,1,0,0,-1,1,1,-1,0,0,1,0,-1,1,-1,-1,0,0,1,1,-1,-1,-1,-1,0,0,0,1,-1,-1,-1,-1,0,0,0,1,-1,-1,1,-1,0,0,0,0,-1,1,1,-1,0,0,1,0,1,1,1,1,0,0,1,0,1,-1,-1,1,0,0,0,1,1,1,-1,1,0,0,1,1,1,-1,-1,1,0,0,0,1,1,1,1,1,0,0,1,0,1,-1,1,1,0,0,0,0,-1,-1,-1,0,-1,0,0,1,1,-1,-1,0,-1,0,1,1,1,-1,1,0,-1,0,1,0,1,-1,1,0,-1,0,1,0,-1,-1,1,0,-1,0,0,0,-1,-1,-1,0,-1,0,0,1,-1,1,-1,0,1,0,0,1,1,1,1,0,1,0,1,0,1,1,-1,0,1,0,1,1,1,1,1,0,1,0,1,0,-1,1,-1,0,1,0,0,1,-1,1,1,0,1,0,0,0]},89:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nin vec3 position;\nin vec3 normal;\nuniform   mat4 mMatrix;\nuniform   mat4 vpMatrix;\n\nout   vec3 vNormal;\nout vec3 WorldPos;\n\nvoid main(void){\n\n\tvec4 pos       = mMatrix * vec4(position, 1.0);\n\tgl_Position    = vpMatrix * pos;\n\n  vNormal = mat3(mMatrix) * normal;\n  WorldPos = pos.xyz;\n\n}\n"},90:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n// material parameters\nuniform vec3 albedo;\nuniform float metallic;\nuniform float roughness;\nuniform float ao;\n\n// IBL\nuniform samplerCube irradianceMap;\nuniform samplerCube prefilterMap;\nuniform sampler2D   brdfLUT;\n\nuniform bool lambertDiffuse;\nuniform vec3 lightPositions[4];\nuniform vec3 lightColors[4];\nuniform vec3 camPos;\n\nin vec3 vNormal;\nin vec3 WorldPos;\nout vec4 outColor;\n\n#define saturate(x) clamp(x, 0.0, 1.0)\nconst float PI = 3.14159265359;\n// D, G, F formula is refered from http://graphicrants.blogspot.tw/2013/08/specular-brdf-reference.html\n// ----------------------------------------------------------------------------\nfloat DistributionGGX(vec3 N, vec3 H, float roughness)\n{\n    float a = roughness*roughness;\n    float a2 = a*a;\n    float NdotH = max(dot(N, H), 0.0);\n    float NdotH2 = NdotH*NdotH;\n\n    float nom   = a2;\n    float denom = (NdotH2 * (a2 - 1.0) + 1.0);\n    denom = PI * denom * denom;\n\n    return nom / denom;//max(denom, 0.001); // prevent divide by zero for roughness=0.0 and NdotH=1.0\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySchlickGGX(float NdotV, float roughness)\n{\n    float r = (roughness + 1.0);\n    float k = (r*r) / 8.0;\n\n    float nom   = NdotV;\n    float denom = NdotV * (1.0 - k) + k;\n\n    return nom / denom;\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)\n{\n    float NdotV = max(dot(N, V), 0.0);\n    float NdotL = max(dot(N, L), 0.0);\n    float ggx2 = GeometrySchlickGGX(NdotV, roughness);\n    float ggx1 = GeometrySchlickGGX(NdotL, roughness);\n\n    return ggx1 * ggx2;\n}\n// ----------------------------------------------------------------------------\nvec3 fresnelSchlick(float cosTheta, vec3 F0)\n{\n    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);\n}\n// deal with IBL\nvec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)\n{\n    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);\n}\n\n// OrenNayar diffuse\nvec3 getDiffuse( vec3 diffuseColor, float roughness4, float NoV, float NoL, float VoH )\n{\n\tfloat VoL = 2. * VoH - 1.;\n\tfloat c1 = 1. - 0.5 * roughness4 / (roughness4 + 0.33);\n\tfloat cosri = VoL - NoV * NoL;\n\tfloat c2 = 0.45 * roughness4 / (roughness4 + 0.09) * cosri * ( cosri >= 0. ? min( 1., NoL / NoV ) : NoL );\n\treturn diffuseColor / PI * ( NoL * c1 + c2 );\n}\n\nvoid main(void){\n    vec3 N = normalize(vNormal);\n    vec3 V = normalize(camPos - WorldPos);\n\n    vec3 F0 = vec3(0.04);\n    F0      = mix(F0, albedo, metallic);\n\n    // reflectance equation\n    vec3 Lo = vec3(0.0);\n    for(int i = 0; i < 4; ++i)\n    {\n        // calculate per-light radiance\n        vec3 L = normalize(lightPositions[i] - WorldPos);\n        vec3 H = normalize(V + L);\n\n        // get all the usefull dot products and clamp them between 0 and 1 just to be safe\n        float NoL\t\t\t\t= saturate( dot( N, L ) );\n        float NoV\t\t\t\t= saturate( dot( N, V ) );\n        float VoH\t\t\t\t= saturate( dot( V, H ) );\n        float NoH\t\t\t\t= saturate( dot( N, H ) );\n\n        float distance = length(lightPositions[i] - WorldPos);\n        float attenuation = 1.0 / (distance * distance);\n        vec3 radiance = lightColors[i] * attenuation;\n\n        // Cook-Torrance BRDF\n        float NDF = DistributionGGX(N, H, roughness);\n        float G   = GeometrySmith(N, V, L, roughness);\n        vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0); //反射百分比\n\n        vec3 nominator    = NDF * G * F;\n        float denominator = 4. * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);\n        vec3 specular = nominator / max(denominator, 0.001); // prevent divide by zero for NdotV=0.0 or NdotL=0.0\n\n        // kS is equal to Fresnel\n        vec3 kS = F;\n        // for energy conservation, the diffuse and specular light can't\n        // be above 1.0 (unless the surface emits light); to preserve this\n        // relationship the diffuse component (kD) should equal 1.0 - kS.\n        vec3 kD = vec3(1.0) - kS;\n        // multiply kD by the inverse metalness such that only non-metals\n        // have diffuse lighting, or a linear blend if partly metal (pure metals\n        // have no diffuse light).\n        kD *= 1.0 - metallic;\n\n        // scale light by NdotL\n        float NdotL = max(dot(N, L), 0.0);\n\n        vec3 diffuse = lambertDiffuse ? albedo / PI : getDiffuse( albedo, roughness, NoV, NoL, VoH );\n        // add to outgoing radiance Lo\n        Lo += (kD * diffuse + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again\n    }\n\n    // ambient lighting (we now use IBL as the ambient term)\n    vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);\n\n    vec3 kS = F;\n    vec3 kD = 1.0 - kS;\n    kD *= 1.0 - metallic;\n\n    vec3 irradiance = texture(irradianceMap, N).rgb;\n    vec3 diffuse    = irradiance * albedo;\n\n    vec3 R = reflect(-V, N);\n    const float MAX_REFLECTION_LOD = 6.0;\n    vec3 prefilteredColor = textureLod(prefilterMap, R,  roughness * MAX_REFLECTION_LOD).rgb;\n    vec2 envBRDF  = texture(brdfLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;\n    vec3 specular = prefilteredColor * (F * envBRDF.x + envBRDF.y);\n\n    vec3 ambient = (kD * diffuse + specular) * ao;\n\n    vec3 color =  ambient + Lo;\n\n    // HDR tonemapping\n    color = color / (color + vec3(1.0));\n    // gamma correct\n    color = pow(color, vec3(1.0/2.2));\n\n    outColor = vec4(color, 1.0);\n\n}\n"},91:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\nin vec3 position;\nin vec3 normal;\nin vec2 texCoord;\nuniform   mat4 mMatrix;\nuniform   mat4 vpMatrix;\n\nout vec3 vNormal;\nout vec3 WorldPos;\nout vec2 TexCoords;\n\nvoid main(void){\n\n\tvec4 pos       = mMatrix * vec4(position, 1.0);\n\tgl_Position    = vpMatrix * pos;\n\n  vNormal = mat3(mMatrix) * normal;\n  WorldPos = pos.xyz;\n  TexCoords = texCoord;\n}\n"},92:function(e,t){e.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n\n// IBL\nuniform samplerCube irradianceMap;\nuniform samplerCube prefilterMap;\nuniform sampler2D   brdfLUT;\n\nuniform sampler2D albedoMap;\nuniform sampler2D normalMap;\nuniform sampler2D roughnessMap;\nuniform sampler2D metallicMap;\nuniform sampler2D aoMap;\n\nuniform bool lambertDiffuse;\nuniform vec3 lightPositions[4];\nuniform vec3 lightColors[4];\nuniform vec3 camPos;\n\nin vec3 vNormal;\nin vec3 WorldPos;\nin vec2 TexCoords;\nout vec4 outColor;\n\n#define saturate(x) clamp(x, 0.0, 1.0)\nconst float PI = 3.14159265359;\n// D, G, F formula is refered from http://graphicrants.blogspot.tw/2013/08/specular-brdf-reference.html\n// ----------------------------------------------------------------------------\nfloat DistributionGGX(vec3 N, vec3 H, float roughness)\n{\n    float a = roughness*roughness;\n    float a2 = a*a;\n    float NdotH = max(dot(N, H), 0.0);\n    float NdotH2 = NdotH*NdotH;\n\n    float nom   = a2;\n    float denom = (NdotH2 * (a2 - 1.0) + 1.0);\n    denom = PI * denom * denom;\n\n    return nom / denom;//max(denom, 0.001); // prevent divide by zero for roughness=0.0 and NdotH=1.0\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySchlickGGX(float NdotV, float roughness)\n{\n    float r = (roughness + 1.0);\n    float k = (r*r) / 8.0;\n\n    float nom   = NdotV;\n    float denom = NdotV * (1.0 - k) + k;\n\n    return nom / denom;\n}\n// ----------------------------------------------------------------------------\nfloat GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)\n{\n    float NdotV = max(dot(N, V), 0.0);\n    float NdotL = max(dot(N, L), 0.0);\n    float ggx2 = GeometrySchlickGGX(NdotV, roughness);\n    float ggx1 = GeometrySchlickGGX(NdotL, roughness);\n\n    return ggx1 * ggx2;\n}\n// ----------------------------------------------------------------------------\nvec3 fresnelSchlick(float cosTheta, vec3 F0)\n{\n    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);\n}\n// deal with IBL\nvec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)\n{\n    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);\n}\n\n// OrenNayar diffuse\nvec3 getDiffuse( vec3 diffuseColor, float roughness4, float NoV, float NoL, float VoH )\n{\n\tfloat VoL = 2. * VoH - 1.;\n\tfloat c1 = 1. - 0.5 * roughness4 / (roughness4 + 0.33);\n\tfloat cosri = VoL - NoV * NoL;\n\tfloat c2 = 0.45 * roughness4 / (roughness4 + 0.09) * cosri * ( cosri >= 0. ? min( 1., NoL / NoV ) : NoL );\n\treturn diffuseColor / PI * ( NoL * c1 + c2 );\n}\nvec3 getNormalFromMap()\n{\n    vec3 tangentNormal = texture(normalMap, TexCoords).xyz * 2.0 - 1.0;\n\n    vec3 Q1  = dFdx(WorldPos);\n    vec3 Q2  = dFdy(WorldPos);\n    vec2 st1 = dFdx(TexCoords);\n    vec2 st2 = dFdy(TexCoords);\n\n    vec3 N   = normalize(vNormal);\n    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);\n    vec3 B  = -normalize(cross(N, T));\n    mat3 TBN = mat3(T, B, N);\n\n    return normalize(TBN * tangentNormal);\n}\n\nvoid main(void){\n    vec3 albedo     = pow(texture(albedoMap, TexCoords).rgb, vec3(2.2));\n    vec3 N     = getNormalFromMap();\n    float metallic  = texture(metallicMap, TexCoords).r;\n    float roughness = texture(roughnessMap, TexCoords).r;\n    float ao        = texture(aoMap, TexCoords).r;\n\n    vec3 V = normalize(camPos - WorldPos);\n\n    vec3 F0 = vec3(0.04);\n    F0      = mix(F0, albedo, metallic);\n\n    // reflectance equation\n    vec3 Lo = vec3(0.0);\n    for(int i = 0; i < 4; ++i)\n    {\n        // calculate per-light radiance\n        vec3 L = normalize(lightPositions[i] - WorldPos);\n        vec3 H = normalize(V + L);\n\n        // get all the usefull dot products and clamp them between 0 and 1 just to be safe\n        float NoL\t\t\t\t= saturate( dot( N, L ) );\n        float NoV\t\t\t\t= saturate( dot( N, V ) );\n        float VoH\t\t\t\t= saturate( dot( V, H ) );\n        float NoH\t\t\t\t= saturate( dot( N, H ) );\n\n        float distance = length(lightPositions[i] - WorldPos);\n        float attenuation = 1.0 / (distance * distance);\n        vec3 radiance = lightColors[i] * attenuation;\n\n        // Cook-Torrance BRDF\n        float NDF = DistributionGGX(N, H, roughness);\n        float G   = GeometrySmith(N, V, L, roughness);\n        vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0); //反射百分比\n\n        vec3 nominator    = NDF * G * F;\n        float denominator = 4. * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);\n        vec3 specular = nominator / max(denominator, 0.001); // prevent divide by zero for NdotV=0.0 or NdotL=0.0\n\n        // kS is equal to Fresnel\n        vec3 kS = F;\n        // for energy conservation, the diffuse and specular light can't\n        // be above 1.0 (unless the surface emits light); to preserve this\n        // relationship the diffuse component (kD) should equal 1.0 - kS.\n        vec3 kD = vec3(1.0) - kS;\n        // multiply kD by the inverse metalness such that only non-metals\n        // have diffuse lighting, or a linear blend if partly metal (pure metals\n        // have no diffuse light).\n        kD *= 1.0 - metallic;\n\n        // scale light by NdotL\n        float NdotL = max(dot(N, L), 0.0);\n\n        vec3 diffuse = lambertDiffuse ? albedo / PI : getDiffuse( albedo, roughness, NoV, NoL, VoH );\n        // add to outgoing radiance Lo\n        Lo += (kD * diffuse + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again\n    }\n\n    // ambient lighting (we now use IBL as the ambient term)\n    vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);\n\n    vec3 kS = F;\n    vec3 kD = 1.0 - kS;\n    kD *= 1.0 - metallic;\n\n    vec3 irradiance = texture(irradianceMap, N).rgb;\n    vec3 diffuse    = irradiance * albedo;\n\n    vec3 R = reflect(-V, N);\n    const float MAX_REFLECTION_LOD = 4.0;\n    vec3 prefilteredColor = textureLod(prefilterMap, R,  roughness * MAX_REFLECTION_LOD).rgb;\n    vec2 envBRDF  = texture(brdfLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;\n    vec3 specular = prefilteredColor * (F * envBRDF.x + envBRDF.y);\n\n    vec3 ambient = (kD * diffuse + specular) * ao;\n\n    vec3 color = ambient + Lo;\n\n    // HDR tonemapping\n    color = color / (color + vec3(1.0));\n    // gamma correct\n    color = pow(color, vec3(1.0/2.2));\n\n    outColor = vec4(color, 1.0);\n\n}\n"}}]);