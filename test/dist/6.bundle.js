(window.webpackJsonp=window.webpackJsonp||[]).push([[6,22],{101:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\nstruct Material {\n    sampler2D diffuse;\n    sampler2D specular;\n    sampler2D emission;\n    float shininess;\n};\nstruct Light {\n    // vec3 position; // directional light only has direction\n    vec3 direction;\n\n    vec3 ambient;\n    vec3 diffuse;\n    vec3 specular;\n};\nin vec3 FragPos;\nin vec3 Normal;\nin vec2 TexCoords;\n\nuniform vec3 camPos;\nuniform Material material;\nuniform Light light;\n\n\nvoid main()\n{\n  // ambient\n  vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;\n\n  // diffuse\n  vec3 norm = normalize(Normal);\n  // vec3 lightDir = normalize(light.position - FragPos);\n  vec3 lightDir = normalize(-light.direction);\n  float diff = max(dot(norm, lightDir), 0.0);\n   vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;\n\n  // specular\n  vec3 viewDir = normalize(camPos - FragPos);\n  vec3 reflectDir = reflect(-lightDir, norm);\n  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);\n  vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;\n\n  vec3 emission = vec3(0.);//texture(material.emission, TexCoords).rgb;\n\n  vec3 result = ambient + diffuse + specular + emission;\n  FragColor = vec4(result, 1.0);\n}\n"},102:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\nstruct Material {\n    sampler2D diffuse;\n    sampler2D specular;\n    float shininess;\n};\n\nstruct Light {\n    vec3 position;\n\n    vec3 ambient;\n    vec3 diffuse;\n    vec3 specular;\n\n    float constant;\n    float linear;\n    float quadratic;\n};\n\nin vec3 FragPos;\nin vec3 Normal;\nin vec2 TexCoords;\n\nuniform vec3 camPos;\nuniform Material material;\nuniform Light light;\n\nvoid main()\n{\n    // ambient\n    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;\n\n    // diffuse\n    vec3 norm = normalize(Normal);\n    vec3 lightDir = normalize(light.position - FragPos);\n    float diff = max(dot(norm, lightDir), 0.0);\n    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;\n\n    // specular\n    vec3 viewDir = normalize(camPos - FragPos);\n    vec3 reflectDir = reflect(-lightDir, norm);\n    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);\n    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;\n\n    // attenuation\n    float distance    = length(light.position - FragPos);\n    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));\n\n    ambient  *= attenuation;\n    diffuse   *= attenuation;\n    specular *= attenuation;\n\n    vec3 result = ambient + diffuse + specular;\n    FragColor = vec4(result, 1.0);\n}\n"},103:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\nstruct Material {\n    sampler2D diffuse;\n    sampler2D specular;\n    float shininess;\n};\n\nstruct Light {\n    vec3 position;\n    vec3 direction;\n\n    vec3 ambient;\n    vec3 diffuse;\n    vec3 specular;\n\n    float cutOff;\n};\n\nin vec3 FragPos;\nin vec3 Normal;\nin vec2 TexCoords;\n\nuniform vec3 camPos;\nuniform Material material;\nuniform Light light;\n\nvoid main()\n{\n  vec3 result;\n  vec3 lightDir = normalize(light.position - FragPos);\n  float theta = dot(lightDir, normalize(-light.direction));\n  if(theta > light.cutOff)\n  {\n    // ambient\n    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;\n\n    // diffuse\n    vec3 norm = normalize(Normal);\n\n    float diff = max(dot(norm, lightDir), 0.0);\n    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;\n\n    // specular\n    vec3 viewDir = normalize(camPos - FragPos);\n    vec3 reflectDir = reflect(-lightDir, norm);\n    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);\n    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;\n\n    result = ambient + diffuse + specular;\n  }\n  else {\n    // 否则，使用环境光，让场景在聚光之外时不至于完全黑暗\n    result = light.ambient * vec3(texture(material.diffuse, TexCoords));\n  }\n\n  FragColor = vec4(result, 1.0);\n}\n"},104:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\n\nvoid main() {\n  FragColor = vec4(1.0);\n}\n"},105:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nlayout (location = 0) in vec3 position;\n\nuniform mat4 mMatrix;\nuniform mat4 vMatrix;\nuniform mat4 pMatrix;\n\nvoid main()\n{\n    gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.0);\n}\n"},142:function(t,e){t.exports="// basic.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 position;\nattribute vec2 texCoord;\nattribute vec3 normal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);\n    vTextureCoord = texCoord;\n    vNormal = normal;\n}"},143:function(t,e){t.exports="// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision lowp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform float time;\n// uniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}"},28:function(t,e,s){"use strict";var i=s(0),r=s(14),a=s(12);s(144);const n=(t,e)=>{if(t.length!==e.length)return!1;for(let s=0;s<t.length;s++)if(t[s]!==e[s])return!1;return!0},h=t=>{const e=t.split("\n");for(let t=0;t<e.length;t++)e[t]=`${t+1}: ${e[t]}`;return e.join("\n")},u=t=>t.slice?t.slice(0):new Float32Array(t),o=s(142),p=s(143),c={float:"uniform1f",vec2:"uniform2fv",vec3:"uniform3fv",vec4:"uniform4fv",int:"uniform1i",mat3:"uniformMatrix3fv",mat4:"uniformMatrix4fv"};class l{constructor(t=o,e=p,s){this.parameters=[],this._uniformTextures=[],this._varyings=s,t||(t=o),e||(e=o);const i=this._createShaderProgram(t,!0),r=this._createShaderProgram(e,!1);this._attachShaderProgram(i,r)}use(){this.bind()}bind(){i.c.useProgram(this.shaderProgram),i.a.useShader(this)}uniform(t,e,s){if("object"==typeof t)return void this.uniformObject(t);const r=c[e]||e;let a,h=!1,o=-1;for(let e=0;e<this.parameters.length;e++)if((a=this.parameters[e]).name===t){h=!0,o=e;break}let p=!1;if(h?(this.shaderProgram[t]=a.uniformLoc,p=a.isNumber):(p="uniform1i"===r||"uniform1f"===r,this.shaderProgram[t]=i.c.getUniformLocation(this.shaderProgram,t),p?this.parameters.push({name:t,type:r,value:s,uniformLoc:this.shaderProgram[t],isNumber:p}):this.parameters.push({name:t,type:r,value:u(s),uniformLoc:this.shaderProgram[t],isNumber:p}),o=this.parameters.length-1),this.parameters[o].uniformLoc)if(-1===r.indexOf("Matrix"))if(p){(this.parameters[o].value!==s||!h)&&(i.c[r](this.shaderProgram[t],s),this.parameters[o].value=s)}else n(this.parameters[o].value,s)&&h||(i.c[r](this.shaderProgram[t],s),this.parameters[o].value=u(s));else n(this.parameters[o].value,s)&&h||(i.c[r](this.shaderProgram[t],!1,s),this.parameters[o].value=u(s))}style(t){this.uniformObject(t)}uniformObject(t){for(const e in t)if(t[e]instanceof r.a||t[e]instanceof a.a){const s=t[e];let i=-1;this._uniformTextures.forEach((t,r)=>{t.name===e&&(i=r,t.texture=s)}),-1===i&&(i=this._uniformTextures.length,this._uniformTextures.push({name:e,texture:s})),this.uniform(e,"uniform1i",i),s.bind(i)}else{let s=t[e];const i=l.getUniformType(s);if(s.concat&&s[0].concat){let t=[];for(let e=0;e<s.length;e++)t=t.concat(s[e]);s=t}this.uniform(e,i,s)}}_createShaderProgram(t,e){const s=e?i.c.VERTEX_SHADER:i.c.FRAGMENT_SHADER,r=i.c.createShader(s);return i.c.shaderSource(r,t),i.c.compileShader(r),i.c.getShaderParameter(r,i.c.COMPILE_STATUS)?r:(console.warn("Error in Shader : ",i.c.getShaderInfoLog(r)),console.log(h(t)),null)}_attachShaderProgram(t,e){this.shaderProgram=i.c.createProgram(),i.c.attachShader(this.shaderProgram,t),i.c.attachShader(this.shaderProgram,e),i.c.deleteShader(t),i.c.deleteShader(e),this._varyings&&(console.log("Transform feedback setup : ",this._varyings),i.c.transformFeedbackVaryings(this.shaderProgram,this._varyings,i.c.SEPARATE_ATTRIBS)),i.c.linkProgram(this.shaderProgram)}}l.getUniformType=function(t){const e=function(t){return 9===t.length?"uniformMatrix3fv":16===t.length?"uniformMatrix4fv":`vec${t.length}`};return!!t.length?t[0].concat?e(t[0]):e(t):"float"},e.a=l},37:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nlayout (location = 0) in vec3 position;\nlayout (location = 1) in vec3 normal;\nlayout (location = 2) in vec2 texCoord;\n\nuniform mat4 mMatrix;\nuniform mat4 vMatrix;\nuniform mat4 pMatrix;\n\nout vec2 TexCoords;\nout vec3 Normal;\nout vec3 FragPos;\n\nvoid main()\n{\n    FragPos = vec3(mMatrix * vec4(position, 1.0));\n    Normal = mat3(transpose(inverse(mMatrix))) * normal;\n    TexCoords = texCoord;\n\n    gl_Position = pMatrix * vMatrix * vec4(FragPos, 1.0);\n}\n"},4:function(t,e){var s=0,i=3553;function r(t,e,s){return 9728|+t|+e<<8|+(e&&s)<<1}function a(t,e){return this._uid=s++,this.gl=t,this.id=this.gl.createTexture(),this.width=0,this.height=0,this.format=e||t.RGB,this.type=t.UNSIGNED_BYTE,this.img=null,t.bindTexture(i,this.id),this.setFilter(!0),this}a.prototype={fromImage:function(t){var e=this.gl;return this.img=t,this.width=t.width,this.height=t.height,e.bindTexture(i,this.id),e.texImage2D(i,0,this.format,this.format,this.type,t),this},fromData:function(t,e,s,r){var a=this.gl;return this.width=t,this.height=e,s=s||null,this.type=r||a.UNSIGNED_BYTE,a.bindTexture(i,this.id),window.useWebgl2?r===a.RGBA16F?a.texImage2D(a.TEXTURE_2D,0,this.type,t,e,0,this.format,a.HALF_FLOAT,s):r===a.RG32F||r===a.RGBA32F||r===a.RGB32F?a.texImage2D(a.TEXTURE_2D,0,this.type,t,e,0,this.format,a.FLOAT,s):a.texImage2D(i,0,this.format,t,e,0,this.format,this.type,s):a.texImage2D(i,0,this.format,t,e,0,this.format,this.type,s),this},bind:function(t){var e=this.gl;void 0!==t&&e.activeTexture(e.TEXTURE0+(0|t)),e.bindTexture(i,this.id)},dispose:function(){this.gl&&this.gl.deleteTexture(this.id),this.id=null,this.gl=null},setFilter:function(t,e,s){var a=this.gl,n=r(!!t,!!e,!!s);a.texParameteri(i,a.TEXTURE_MAG_FILTER,r(!!t,!1,!1)),a.texParameteri(i,a.TEXTURE_MIN_FILTER,n)},repeat:function(){this.wrap(this.gl.REPEAT)},clamp:function(){this.wrap(this.gl.CLAMP_TO_EDGE)},mirror:function(){this.wrap(this.gl.MIRRORED_REPEAT)},wrap:function(t){var e=this.gl;e.texParameteri(i,e.TEXTURE_WRAP_S,t),e.texParameteri(i,e.TEXTURE_WRAP_T,t)}},t.exports=a},5:function(t,e,s){"use strict";s.r(e);var i=s(2),r=s(28),a=s(1),n=s(0);const h=function(t,e,s){const i=e||{};return t.touches&&!s?(i.x=t.touches[0].pageX,i.y=t.touches[0].pageY):t.touches?t.touches&&s&&(i.x=t.touches[1].pageX,i.y=t.touches[1].pageY):(i.x=t.clientX,i.y=t.clientY),i},u=1e-4;class o{constructor(t=[0,0,0],e=[0,1,0]){Object(i.a)(this,"cameraPos",void 0),Object(i.a)(this,"up",void 0),Object(i.a)(this,"cameraFront",[0,0,-1]),Object(i.a)(this,"_mouse",{}),Object(i.a)(this,"_preMouse",{}),Object(i.a)(this,"_mousedown",!1),Object(i.a)(this,"_rx",0),Object(i.a)(this,"_ry",0),Object(i.a)(this,"_preRx",0),Object(i.a)(this,"_preRy",0),Object(i.a)(this,"_targetRx",0),Object(i.a)(this,"_targetRy",0),Object(i.a)(this,"_viewMatrix",a.b.identity(a.b.create())),Object(i.a)(this,"_width",n.b.width),Object(i.a)(this,"_height",n.b.height),Object(i.a)(this,"sensitivity",1),Object(i.a)(this,"target",[0,0,0]),Object(i.a)(this,"offset",[0,0,0]),Object(i.a)(this,"radius",5),Object(i.a)(this,"_targetRadius",5),Object(i.a)(this,"_updateWheel",!1),this.position=t,this.up=e,this.projMatrix=a.b.create(),a.b.perspective(this.projMatrix,Object(n.d)(45),n.b.clientWidth/n.b.clientHeight,.1,100),this._addEvents()}setProj(t,e,s){a.b.perspective(this.projMatrix,Object(n.d)(t),n.b.clientWidth/n.b.clientHeight,e,s)}_addEvents(){n.b.addEventListener("mousedown",t=>this._down(t)),n.b.addEventListener("mousemove",t=>this._move(t)),document.addEventListener("mouseup",t=>this._up(t)),n.b.addEventListener("mousewheel",t=>this._onWheel(t)),n.b.addEventListener("DOMMouseScroll",t=>this._onWheel(t))}_down(t){this._mousedown=!0,h(t,this._mouse),h(t,this._preMouse),this._preRx=this._targetRx,this._preRy=this._targetRy}_move(t){if(this._mousedown){h(t,this._mouse);let e=(this._mouse.x-this._preMouse.x)/this._width,s=(this._mouse.y-this._preMouse.y)/this._height;this._targetRx=this._preRx+e*Math.PI*2*this.sensitivity,this._targetRy=this._preRy+s*Math.PI*this.sensitivity}}_up(t){this._mousedown=!1}updateMatrix(){this._rx+=.1*(this._targetRx-this._rx),Math.abs(this._targetRx-this._rx)<u&&(this._rx=this._targetRx),this._ry+=.1*(this._targetRy-this._ry),Math.abs(this._targetRy-this._ry)<u&&(this._ry=this._targetRy),this._updateWheel&&(this.radius+=.1*(this._targetRadius-this.radius),Math.abs(this._targetRadius-this.radius)<u&&(this.radius=this._targetRadius)),this.position[1]=Math.sin(this._ry)*this.radius;let t=Math.abs(Math.cos(this._ry)*this.radius);this.position[0]=Math.cos(this._rx+.5*Math.PI)*t,this.position[2]=Math.sin(this._rx+.5*Math.PI)*t,this.position=[this.position[0]+this.offset[0],this.position[1]+this.offset[1],this.position[2]+this.offset[2]],a.b.lookAt(this._viewMatrix,this.position,this.target,this.up)}_onWheel(t){const e=t.wheelDelta,s=t.detail;let i=0;i=s?e?e/s/40*s>0?1:-1:-s/3:e/120,this._targetRadius=this.radius+1*-i,this._targetRadius<=1&&(this._targetRadius=1),this._updateWheel=!0}get viewMatrix(){return this._viewMatrix}set rx(t){this._targetRx=t}}var p=s(43);s.d(e,"default",function(){return c});class c{constructor(){Object(i.a)(this,"rotateQ",a.c.create()),Object(i.a)(this,"mousePos",{x:0,y:0}),Object(i.a)(this,"camera",new o),Object(i.a)(this,"pMatrix",a.b.identity(a.b.create())),Object(i.a)(this,"mvpMatrix",a.b.identity(a.b.create())),Object(i.a)(this,"tmpMatrix",a.b.identity(a.b.create())),Object(i.a)(this,"_params",{}),Object(i.a)(this,"gui",new p.a({width:300})),this.vMatrix=this.camera.viewMatrix,n.a.setCamera(this.camera),this.init(),this.attrib(),this.prepare(),this._setGUI(),this._animate=this.animate.bind(this),n.c.enable(n.c.DEPTH_TEST),n.c.depthFunc(n.c.LEQUAL),n.c.enable(n.c.CULL_FACE)}init(){}compile(t,e){return new r.a(t,e)}attrib(){}uniform(){}prepare(){}animate(){requestAnimationFrame(this._animate),this.camera.updateMatrix(),this.uniform(),this.render()}render(){}play(){this.animate()}_setGUI(){}addGUIParams(t){return Object.assign(this._params,t)}get params(){return this._params}set params(t){throw Error("Params has no setter,please use addGUIParams")}}},51:function(t,e,s){"use strict";s.r(e),s.d(e,"default",function(){return R});var i=s(2),r=s(5),a=s(8),n=s(37),h=s.n(n),u=s(101),o=s.n(u),p=s(102),c=s.n(p),l=s(103),m=s.n(l),f=s(104),d=s.n(f),g=s(105),v=s.n(g),b=s(4),x=s.n(b),_=s(1),P=s(0);let M=_.b.identity(_.b.create()),T=_.b.identity(_.b.create());const y=[.33,.42,.18],w=[.2,-1,-.3].map(t=>50*t),E=[[0,0,0],[2,5,-15],[-1.5,-2.2,-2.5],[-3.8,-2,-12.3],[2.4,-.4,-3.5],[-1.7,3,-7.5],[1.3,-2,-2.5],[1.5,2,-2.5],[1.5,.2,-1.5],[-1.3,1,-1.5]];class R extends r.default{constructor(){super(),Object(i.a)(this,"count",0)}init(){this.prg=this.compile(h.a,o.a),this.pointPrg=this.compile(h.a,c.a),this.spotPrg=this.compile(h.a,m.a),this.lampPrg=this.compile(v.a,d.a)}attrib(){this.cube=a.a.cube(1),this.lamp=a.a.s}prepare(){P.c.enable(P.c.DEPTH_TEST),P.c.depthFunc(P.c.LEQUAL),P.c.clearColor(.3,.3,.3,1),P.c.clearDepth(1),this.diffuseTexture=new x.a(P.c,P.c.RGBA).fromImage(getAssets.cubeDiffuse),this.specularTexture=new x.a(P.c,P.c.RGBA).fromImage(getAssets.cubeSpecular),this.emissionTexture=new x.a(P.c,P.c.RGBA).fromImage(getAssets.cubeEmission),this.camera.radius=6}_setGUI(){this.addGUIParams({directionalLight:!0,pointLight:!1,spotLight:!1});let t=this.gui.addFolder("diffuse model");t.add(this.params,"directionalLight").listen().onChange(()=>{this.setChecked("directionalLight")}),t.add(this.params,"pointLight").listen().onChange(()=>{this.setChecked("pointLight")}),t.add(this.params,"spotLight").listen().onChange(()=>{this.setChecked("spotLight")}),t.open()}setChecked(t){this.params.directionalLight=!1,this.params.pointLight=!1,this.params.spotLight=!1,this.params[t]=!0}uniform(){M=this.camera.viewMatrix,_.b.perspective(T,Object(P.d)(60),P.b.clientWidth/P.b.clientHeight,.1,100)}render(){P.c.clear(P.c.COLOR_BUFFER_BIT|P.c.DEPTH_BUFFER_BIT),this.diffuseTexture.bind(0),this.specularTexture.bind(1),this.emissionTexture.bind(2),this.params.directionalLight?(this.prg.use(),this.cube.bind(this.prg),this.prg.style({vMatrix:M,pMatrix:T,camPos:this.camera.position,"material.shininess":30,"material.diffuse":0,"material.specular":1,"material.emission":2,"light.ambient":[.2,.2,.2],"light.diffuse":[.5,.5,.5],"light.specular":[1,1,1],"light.direction":[-w[0],-w[1],-w[2]]}),E.map((t,e)=>{let s=_.b.create();_.b.rotate(s,s,Object(P.d)(20*e),w),_.b.translate(s,s,t),this.prg.style({mMatrix:s}),this.cube.draw()})):this.params.pointLight?(this.pointPrg.use(),this.cube.bind(this.pointPrg),this.pointPrg.style({vMatrix:M,pMatrix:T,camPos:this.camera.position,"material.shininess":30,"material.diffuse":0,"material.specular":1,"material.emission":2,"light.ambient":[.2,.2,.2],"light.diffuse":[.5,.5,.5],"light.specular":[1,1,1],"light.position":[0,0,1],"light.constant":1,"light.linear":.09,"light.quadratic":.032}),E.map((t,e)=>{let s=_.b.create();_.b.rotate(s,s,Object(P.d)(20*e),w),_.b.translate(s,s,t),this.pointPrg.style({mMatrix:s}),this.cube.draw()})):this.params.spotLight&&(this.spotPrg.use(),this.cube.bind(this.spotPrg),this.spotPrg.style({vMatrix:M,pMatrix:T,camPos:this.camera.position,"material.shininess":30,"material.diffuse":0,"material.specular":1,"material.emission":2,"light.ambient":[.1,.1,.1],"light.diffuse":[.5,.5,.5],"light.specular":[1,1,1],"light.position":this.camera.position,"light.direction":[-this.camera.position[0],-this.camera.position[1],-this.camera.position[2]],"light.cutOff":Object(P.d)(12.5)}),E.map((t,e)=>{let s=_.b.create();_.b.rotate(s,s,Object(P.d)(20*e),w),_.b.translate(s,s,t),this.spotPrg.style({mMatrix:s}),this.cube.draw()}));let t=_.b.identity(_.b.create());_.b.scale(t,t,[.05,.05,.05]),_.b.translate(t,t,w),this.lampPrg.use(),this.lampPrg.style({mMatrix:t,vMatrix:M,pMatrix:T,lightColor:y}),P.c.bindVertexArray(this.lampVao),P.c.drawArrays(P.c.TRIANGLES,0,36)}}},8:function(t,e,s){"use strict";var i=s(3);const r={};let a;r.plane=function(t,e,s,r="xy",a=4){const n=[],h=[],u=[],o=[],p=t/s,c=e/s,l=1/s,m=.5*-t,f=.5*-e;let d=0;for(let t=0;t<s;t++)for(let e=0;e<s;e++){const i=p*t+m,a=c*e+f,g=t/s,v=e/s;"xz"===r?(n.push([i,0,a+c]),n.push([i+p,0,a+c]),n.push([i+p,0,a]),n.push([i,0,a]),h.push([g,1-(v+l)]),h.push([g+l,1-(v+l)]),h.push([g+l,1-v]),h.push([g,1-v]),o.push([0,1,0]),o.push([0,1,0]),o.push([0,1,0]),o.push([0,1,0])):"yz"===r?(n.push([0,a,i]),n.push([0,a,i+p]),n.push([0,a+c,i+p]),n.push([0,a+c,i]),h.push([g,v]),h.push([g+l,v]),h.push([g+l,v+l]),h.push([g,v+l]),o.push([1,0,0]),o.push([1,0,0]),o.push([1,0,0]),o.push([1,0,0])):(n.push([i,a,0]),n.push([i+p,a,0]),n.push([i+p,a+c,0]),n.push([i,a+c,0]),h.push([g,v]),h.push([g+l,v]),h.push([g+l,v+l]),h.push([g,v+l]),o.push([0,0,1]),o.push([0,0,1]),o.push([0,0,1]),o.push([0,0,1])),u.push(4*d+0),u.push(4*d+1),u.push(4*d+2),u.push(4*d+0),u.push(4*d+2),u.push(4*d+3),d++}const g=new i.a(a);return g.bufferVertex(n),g.bufferTexCoord(h),g.bufferIndex(u),g.bufferNormal(o),g},r.sphere=function(t,e,s=!1,r=4){const a=[],n=[],h=[],u=[],o=1/e;let p=0;function c(s,i,r=!1){const a=s/e*Math.PI-.5*Math.PI,n=i/e*Math.PI*2,h=r?1:t,u=[];u[1]=Math.sin(a)*h;const o=Math.cos(a)*h;u[0]=Math.cos(n)*o,u[2]=Math.sin(n)*o;return u[0]=Math.floor(1e4*u[0])/1e4,u[1]=Math.floor(1e4*u[1])/1e4,u[2]=Math.floor(1e4*u[2])/1e4,u}for(let t=0;t<e;t++)for(let s=0;s<e;s++){a.push(c(t,s)),a.push(c(t+1,s)),a.push(c(t+1,s+1)),a.push(c(t,s+1)),u.push(c(t,s,!0)),u.push(c(t+1,s,!0)),u.push(c(t+1,s+1,!0)),u.push(c(t,s+1,!0));const i=s/e,r=t/e;n.push([1-i,r]),n.push([1-i,r+o]),n.push([1-i-o,r+o]),n.push([1-i-o,r]),h.push(4*p+0),h.push(4*p+1),h.push(4*p+2),h.push(4*p+0),h.push(4*p+2),h.push(4*p+3),p++}s&&h.reverse();const l=new i.a(r);return l.bufferVertex(a),l.bufferTexCoord(n),l.bufferIndex(h),l.bufferNormal(u),l},r.cube=function(t,e,s,r=4){const a=t/2,n=(e=e||t)/2,h=(s=s||t)/2,u=[],o=[],p=[],c=[];let l=0;u.push([-a,n,-h]),u.push([a,n,-h]),u.push([a,-n,-h]),u.push([-a,-n,-h]),c.push([0,0,-1]),c.push([0,0,-1]),c.push([0,0,-1]),c.push([0,0,-1]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++,u.push([a,n,-h]),u.push([a,n,h]),u.push([a,-n,h]),u.push([a,-n,-h]),c.push([1,0,0]),c.push([1,0,0]),c.push([1,0,0]),c.push([1,0,0]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++,u.push([a,n,h]),u.push([-a,n,h]),u.push([-a,-n,h]),u.push([a,-n,h]),c.push([0,0,1]),c.push([0,0,1]),c.push([0,0,1]),c.push([0,0,1]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++,u.push([-a,n,h]),u.push([-a,n,-h]),u.push([-a,-n,-h]),u.push([-a,-n,h]),c.push([-1,0,0]),c.push([-1,0,0]),c.push([-1,0,0]),c.push([-1,0,0]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++,u.push([a,n,-h]),u.push([-a,n,-h]),u.push([-a,n,h]),u.push([a,n,h]),c.push([0,1,0]),c.push([0,1,0]),c.push([0,1,0]),c.push([0,1,0]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++,u.push([a,-n,h]),u.push([-a,-n,h]),u.push([-a,-n,-h]),u.push([a,-n,-h]),c.push([0,-1,0]),c.push([0,-1,0]),c.push([0,-1,0]),c.push([0,-1,0]),o.push([0,0]),o.push([1,0]),o.push([1,1]),o.push([0,1]),p.push(4*l+0),p.push(4*l+1),p.push(4*l+2),p.push(4*l+0),p.push(4*l+2),p.push(4*l+3),l++;const m=new i.a(r);return m.bufferVertex(u),m.bufferTexCoord(o),m.bufferIndex(p),m.computeNormals(c),m},r.skybox=function(t,e=4){const s=[],r=[],a=[],n=[];let h=0;s.push([t,t,-t]),s.push([-t,t,-t]),s.push([-t,-t,-t]),s.push([t,-t,-t]),n.push([0,0,-1]),n.push([0,0,-1]),n.push([0,0,-1]),n.push([0,0,-1]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3),h++,s.push([t,-t,-t]),s.push([t,-t,t]),s.push([t,t,t]),s.push([t,t,-t]),n.push([1,0,0]),n.push([1,0,0]),n.push([1,0,0]),n.push([1,0,0]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3),h++,s.push([-t,t,t]),s.push([t,t,t]),s.push([t,-t,t]),s.push([-t,-t,t]),n.push([0,0,1]),n.push([0,0,1]),n.push([0,0,1]),n.push([0,0,1]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3),h++,s.push([-t,-t,t]),s.push([-t,-t,-t]),s.push([-t,t,-t]),s.push([-t,t,t]),n.push([-1,0,0]),n.push([-1,0,0]),n.push([-1,0,0]),n.push([-1,0,0]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3),h++,s.push([t,t,t]),s.push([-t,t,t]),s.push([-t,t,-t]),s.push([t,t,-t]),n.push([0,1,0]),n.push([0,1,0]),n.push([0,1,0]),n.push([0,1,0]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3),h++,s.push([t,-t,-t]),s.push([-t,-t,-t]),s.push([-t,-t,t]),s.push([t,-t,t]),n.push([0,-1,0]),n.push([0,-1,0]),n.push([0,-1,0]),n.push([0,-1,0]),r.push([0,0]),r.push([1,0]),r.push([1,1]),r.push([0,1]),a.push(4*h+0),a.push(4*h+1),a.push(4*h+2),a.push(4*h+0),a.push(4*h+2),a.push(4*h+3);const u=new i.a(e);return u.bufferVertex(s),u.bufferTexCoord(r),u.bufferIndex(a),u.bufferNormal(n),u},r.bigTriangle=function(){if(!a){const t=[2,1,0],e=[[-1,-1],[-1,4],[4,-1]];(a=new i.a).bufferData(e,"position",2),a.bufferIndex(t)}return a},e.a=r}}]);