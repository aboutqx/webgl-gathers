(window.webpackJsonp=window.webpackJsonp||[]).push([[9,20],{12:function(t,e){function i(t){if(this.gl=t,void 0!==t.bindVertexArray)this._impl=new s(this);else{var e=t.getExtension("OES_vertex_array_object");e?(!function(t,e){t.bindVertexArray=function(){return e.bindVertexArrayOES.apply(e,arguments)},t.createVertexArray=function(){return e.createVertexArrayOES.apply(e,arguments)},t.deleteVertexArray=function(){return e.deleteVertexArrayOES.apply(e,arguments)},t.isVertexArray=function(){return e.isVertexArrayOES.apply(e,arguments)}}(t,e),this._impl=new s(this)):this._impl=new r(this)}}function s(t){this._vao=t,this._handle=null}function r(t){this._vao=t}i.prototype={dispose:function(){this._impl.dispose(),this._impl=null},setup:function(t,e,i){t.ready||t._grabParameters(),this._impl.setup(t,e,i)},bind:function(){this._impl.bind()},unbind:function(){this._impl.unbind()}},s.prototype={dispose:function(){this.release(),this._vao=null},setup:function(t,e,i){this.release();var s=this._vao.gl;this._handle=s.createVertexArray(),s.bindVertexArray(this._handle);for(var r=0;r<e.length;r++)e[r].attribPointer(t);void 0!==i&&i.bind(),s.bindVertexArray(null)},bind:function(){this._vao.gl.bindVertexArray(this._handle)},unbind:function(){this._vao.gl.bindVertexArray(null)},release:function(){this._handle&&(this._vao.gl.deleteVertexArray(this._handle),this._handle=null)}},r.prototype={dispose:function(){this._vao=null,this.prg=null,this.buffers=null,this.indices=null},setup:function(t,e,i){this.prg=t,this.buffers=e,this.indices=i},bind:function(){for(var t=0;t<this.buffers.length;t++)this.buffers[t].attribPointer(this.prg);void 0!==this.indices&&this.indices.bind()},unbind:function(){}},t.exports=i},3:function(t,e){var i=0,s=3553;function r(t,e,i){return 9728|+t|+e<<8|+(e&&i)<<1}function n(t,e){return this._uid=i++,this.gl=t,this.id=this.gl.createTexture(),this.width=0,this.height=0,this.format=e||t.RGB,this.type=t.UNSIGNED_BYTE,this.img=null,t.bindTexture(s,this.id),this.setFilter(!0),this}n.prototype={fromImage:function(t){var e=this.gl;return this.img=t,this.width=t.width,this.height=t.height,e.bindTexture(s,this.id),e.texImage2D(s,0,this.format,this.format,this.type,t),this},fromData:function(t,e,i,r){var n=this.gl;return this.width=t,this.height=e,i=i||null,this.type=r||n.UNSIGNED_BYTE,n.bindTexture(s,this.id),window.useWebgl2?r===n.RGBA16F?n.texImage2D(n.TEXTURE_2D,0,this.type,t,e,0,this.format,n.HALF_FLOAT,i):r===n.RG32F||r===n.RGBA32F||r===n.RGB32F?n.texImage2D(n.TEXTURE_2D,0,this.type,t,e,0,this.format,n.FLOAT,i):n.texImage2D(s,0,this.format,t,e,0,this.format,this.type,i):n.texImage2D(s,0,this.format,t,e,0,this.format,this.type,i),this},bind:function(t){var e=this.gl;void 0!==t&&e.activeTexture(e.TEXTURE0+(0|t)),e.bindTexture(s,this.id)},dispose:function(){this.gl&&this.gl.deleteTexture(this.id),this.id=null,this.gl=null},setFilter:function(t,e,i){var n=this.gl,a=r(!!t,!!e,!!i);n.texParameteri(s,n.TEXTURE_MAG_FILTER,r(!!t,!1,!1)),n.texParameteri(s,n.TEXTURE_MIN_FILTER,a)},repeat:function(){this.wrap(this.gl.REPEAT)},clamp:function(){this.wrap(this.gl.CLAMP_TO_EDGE)},mirror:function(){this.wrap(this.gl.MIRRORED_REPEAT)},wrap:function(t){var e=this.gl;e.texParameteri(s,e.TEXTURE_WRAP_S,t),e.texParameteri(s,e.TEXTURE_WRAP_T,t)}},t.exports=n},34:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nin vec3 position;\nin vec2 texcoord;\nuniform   mat4 mvpMatrix;\nout   vec2 TexCoords;\n\nvoid main(void){\n    TexCoords = texcoord;\n    gl_Position = mvpMatrix * vec4(position, 1.0);\n}\n"},43:function(t,e,i){"use strict";i.r(e),i.d(e,"default",function(){return b});var s=i(2),r=i(5),n=i(7),a=i(0),h=i(3),o=i.n(h),u=i(34),d=i.n(u),l=i(69),f=i.n(l),c=i(70),p=i.n(c),g=i(1),m=i(12),_=i.n(m);class b extends r.default{constructor(){super(),Object(s.a)(this,"count",0)}init(){this.outlinePrg=this.compile(d.a,p.a),this.prg=this.compile(d.a,f.a),a.d.pixelStorei(a.d.UNPACK_FLIP_Y_WEBGL,!0)}attrib(){this.cubeBuffer=new n.a(a.d,new Float32Array([-.5,-.5,-.5,0,0,.5,-.5,-.5,1,0,.5,.5,-.5,1,1,.5,.5,-.5,1,1,-.5,.5,-.5,0,1,-.5,-.5,-.5,0,0,-.5,-.5,.5,0,0,.5,-.5,.5,1,0,.5,.5,.5,1,1,.5,.5,.5,1,1,-.5,.5,.5,0,1,-.5,-.5,.5,0,0,-.5,.5,.5,1,0,-.5,.5,-.5,1,1,-.5,-.5,-.5,0,1,-.5,-.5,-.5,0,1,-.5,-.5,.5,0,0,-.5,.5,.5,1,0,.5,.5,.5,1,0,.5,.5,-.5,1,1,.5,-.5,-.5,0,1,.5,-.5,-.5,0,1,.5,-.5,.5,0,0,.5,.5,.5,1,0,-.5,-.5,-.5,0,1,.5,-.5,-.5,1,1,.5,-.5,.5,1,0,.5,-.5,.5,1,0,-.5,-.5,.5,0,0,-.5,-.5,-.5,0,1,-.5,.5,-.5,0,1,.5,.5,-.5,1,1,.5,.5,.5,1,0,.5,.5,.5,1,0,-.5,.5,.5,0,0,-.5,.5,-.5,0,1])),this.planeBuffer=new n.a(a.d,new Float32Array([3,-.5,3,1,0,-3,-.5,3,0,0,-3,-.5,-3,0,1,3,-.5,3,1,0,-3,-.5,-3,0,1,3,-.5,-3,1,1])),this.cubeBuffer.attrib("position",3,a.d.FLOAT),this.cubeBuffer.attrib("texcoord",2,a.d.FLOAT),this.planeBuffer.attrib("position",3,a.d.FLOAT),this.planeBuffer.attrib("texcoord",2,a.d.FLOAT),this.planeVao=new _.a(a.d),this.planeVao.setup(this.prg,[this.planeBuffer]),this.cubeVao=new _.a(a.d),this.cubeVao.setup(this.prg,[this.cubeBuffer]),this.texture=new o.a(a.d,a.d.RGBA);let t=getAssets.splash;this.texture.fromImage(t),this.texture.bind(),a.d.texParameteri(a.d.TEXTURE_2D,a.d.TEXTURE_MAG_FILTER,a.d.LINEAR),a.d.texParameteri(a.d.TEXTURE_2D,a.d.TEXTURE_MIN_FILTER,a.d.NEAREST_MIPMAP_NEAREST),a.d.generateMipmap(a.d.TEXTURE_2D),a.d.bindTexture(a.d.TEXTURE_2D,null)}_setGUI(){this.addGUIParams({lod:5,LINEAR_MIPMAP_LINEAR:!1,NEAREST_MIPMAP_NEAREST:!0});let t=this.gui.addFolder("tetxureLod lod param");t.add(this.params,"lod",1,Math.log2(512)).step(1),t.open();let e=this.gui.addFolder("TEXTURE_MIN_FILTER");e.add(this.params,"LINEAR_MIPMAP_LINEAR").listen().onChange(()=>{this.setChecked("LINEAR_MIPMAP_LINEAR")}),e.add(this.params,"NEAREST_MIPMAP_NEAREST").listen().onChange(()=>{this.setChecked("NEAREST_MIPMAP_NEAREST")}),e.open()}setChecked(t){this.texture.bind(),a.d.texParameteri(a.d.TEXTURE_2D,a.d.TEXTURE_MIN_FILTER,a.d[t]),this.params.LINEAR_MIPMAP_LINEAR=!1,this.params.NEAREST_MIPMAP_NEAREST=!1,this.params[t]=!0}prepare(){let t=g.a.identity(g.a.create()),e=g.a.identity(g.a.create());this.mvpMatrix=g.a.identity(g.a.create()),this.tmpMatrix=g.a.identity(g.a.create()),g.a.lookAt(t,[0,0,4],[0,0,0],[0,1,0]),g.a.perspective(e,Object(a.e)(45),a.a.clientWidth/a.a.clientHeight,.1,1e3),g.a.multiply(this.tmpMatrix,e,t),a.d.enable(a.d.DEPTH_TEST),a.d.depthFunc(a.d.LESS),a.d.enable(a.d.STENCIL_TEST),a.d.stencilFunc(a.d.NOTEQUAL,1,255),a.d.stencilOp(a.d.KEEP,a.d.KEEP,a.d.REPLACE)}uniform(){let t=g.a.identity(g.a.create());this.count++;let e=this.count%360*Math.PI/180;g.a.rotate(t,t,e,[0,1,1]),g.a.multiply(this.mvpMatrix,this.tmpMatrix,t),this.prg.use(),this.texture.bind(0),this.prg.style({mvpMatrix:this.mvpMatrix,texture:0,lod:this.params.lod})}render(){a.d.clearColor(.3,.3,.3,1),a.d.clearDepth(1),a.d.clear(a.d.COLOR_BUFFER_BIT|a.d.DEPTH_BUFFER_BIT|a.d.STENCIL_BUFFER_BIT),a.d.stencilMask(0),this.prg.use(),this.planeVao.bind(),this.planeBuffer.drawTriangles(),this.planeVao.unbind(),a.d.stencilFunc(a.d.ALWAYS,1,255),a.d.stencilMask(255),this.cubeVao.bind(),this.cubeBuffer.drawTriangles(),this.cubeVao.unbind(),a.d.stencilFunc(a.d.NOTEQUAL,1,255),a.d.stencilMask(0),this.outlinePrg.use();let t=g.a.identity(g.a.create()),e=this.count%360*Math.PI/180;g.a.rotate(t,t,e,[0,1,1]),g.a.scale(t,t,[1.1,1.1,1.1]),g.a.multiply(this.mvpMatrix,this.tmpMatrix,t),this.outlinePrg.style({mvpMatrix:this.mvpMatrix}),this.cubeVao.bind(),this.cubeBuffer.drawTriangles(),this.cubeVao.unbind(),a.d.stencilMask(255)}}},5:function(t,e,i){"use strict";i.r(e);var s=i(2),r=0;function n(t,e,i,s){this.gl=t,this.program=t.createProgram(),this.vShader=t.createShader(t.VERTEX_SHADER),this.fShader=t.createShader(t.FRAGMENT_SHADER),this.dyns=[],this.uniforms=[],this.ready=!1,t.attachShader(this.program,this.vShader),t.attachShader(this.program,this.fShader),this._uid=0|r++,this._cuid=0|r++,void 0!==e&&void 0!==i&&this.compile(e,i,s),this.unAssigned=[],this.prevTime=0}function a(t){console.warn(t)}n.debug=!0,n.prototype={use:function(){this.ready||this._grabParameters(),this.gl.useProgram(this.program)},style:function(t,e){if("{}"!==JSON.stringify(t)||0!==this.uniforms.length){if("{}"===JSON.stringify(t)&&this.uniforms.length>0)throw new Error("active uniform not assigned:"+this.uniforms);for(let e in t)"function"==typeof this[e]&&this[e](t[e]);this.unAssigned=this.unAssigned.filter(e=>{let i=!1;for(let s in t)s===e&&(i=!0);return!i}),Date.now()-this.prevTime<62500&&0===this.unAssigned.length&&null!==this.timer&&(clearTimeout(this.timer),this.timer=null),0!==this.unAssigned.length&&void 0===e&&(this.timer=setTimeout(()=>{if(this.unAssigned.length>0)throw new Error("active uniform not assigned: "+this.unAssigned)},1/16)),this.prevTime=Date.now()}},compile:function(t,e,i){this.ready=!1,i=i||"";var s=this.gl;if(!u(s,this.fShader,i+e)||!u(s,this.vShader,i+t))return!1;if(s.linkProgram(this.program),n.debug&&!s.getProgramParameter(this.program,s.LINK_STATUS))return a(s.getProgramInfoLog(this.program)),!1;for(;this.dyns.length>0;)delete this[this.dyns.pop()];return this._cuid=0|r++,!0},dispose:function(){null!==this.gl&&(this.gl.deleteProgram(this.program),this.gl.deleteShader(this.fShader),this.gl.deleteShader(this.vShader),this.gl=null)},_grabParameters:function(){for(var t=this.gl,e=this.program,i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS),s={texIndex:0},r=0;r<i;++r){var n=t.getActiveUniform(e,r);if(null!==n){var a=n.name,h=a.indexOf("[");h>=0&&(a=a.substring(0,h));var o=t.getUniformLocation(e,n.name);this[a]=f(n.type,o,t,s),this.dyns.push(a),this.uniforms.push(a),this.unAssigned.push(a)}else t.getError()}for(var u=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES),d=0;d<u;++d){var l=t.getActiveAttrib(e,d).name,p=t.getAttribLocation(e,l);this[l]=c(p),this.dyns.push(l)}this.ready=!0}},n.prototype.bind=n.prototype.use;var h=["","   ","  "," ",""];function o(t,e){return h[String(e+1).length]+(e+1)+": "+t}function u(t,e,i){return t.shaderSource(e,i),t.compileShader(e),!(n.debug&&!t.getShaderParameter(e,t.COMPILE_STATUS))||(a(t.getShaderInfoLog(e)),a(function(t){return t.split("\n").map(o).join("\n")}(i)),!1)}var d={};function l(t){return t=String(t),"uniform"+d[t]}function f(t,e,i,s){switch(t){case i.FLOAT_MAT2:case i.FLOAT_MAT3:case i.FLOAT_MAT4:return function(t,e,i,s){var r=l(t);return function(){if(arguments.length>0&&void 0!==arguments[0].length){var t=arguments.length>1&&!!arguments[1];i[r+"v"](e,t,arguments[0])}return e}}(t,e,i);case i.SAMPLER_2D:case i.SAMPLER_CUBE:return function(t,e,i,s){var r=s.texIndex++;return function(){return 1===arguments.length&&(void 0!==arguments[0].bind?(arguments[0].bind(r),i.uniform1i(e,r)):i.uniform1i(e,arguments[0])),e}}(0,e,i,s);default:return function(t,e,i,s){var r=l(t);return function(){return 1===arguments.length&&void 0!==arguments[0].length?i[r+"v"](e,arguments[0]):arguments.length>0&&i[r].apply(i,Array.prototype.concat.apply(e,arguments)),e}}(t,e,i)}}function c(t){return function(){return t}}d[5126]="1f",d[35664]="2f",d[35665]="3f",d[35666]="4f",d[35670]=d[5124]=d[35678]=d[35680]="1i",d[35671]=d[35667]="2i",d[35672]=d[35668]="3i",d[35673]=d[35669]="4i",d[35674]="Matrix2f",d[35675]="Matrix3f",d[35676]="Matrix4f";var p=n,g=i(1),m=i(0);const _=function(t,e,i){const s=e||{};return t.touches&&!i?(s.x=t.touches[0].pageX,s.y=t.touches[0].pageY):t.touches?t.touches&&i&&(s.x=t.touches[1].pageX,s.y=t.touches[1].pageY):(s.x=t.clientX,s.y=t.clientY),s},b=1e-4;class E{constructor(t=[0,0,0],e=[0,1,0]){Object(s.a)(this,"cameraPos",void 0),Object(s.a)(this,"up",void 0),Object(s.a)(this,"cameraFront",[0,0,-1]),Object(s.a)(this,"_mouse",{}),Object(s.a)(this,"_preMouse",{}),Object(s.a)(this,"_mousedown",!1),Object(s.a)(this,"_rx",0),Object(s.a)(this,"_ry",0),Object(s.a)(this,"_preRx",0),Object(s.a)(this,"_preRy",0),Object(s.a)(this,"_targetRx",0),Object(s.a)(this,"_targetRy",0),Object(s.a)(this,"_tmp",g.a.identity(g.a.create())),Object(s.a)(this,"_width",m.a.width),Object(s.a)(this,"_height",m.a.height),Object(s.a)(this,"sensitivity",1),Object(s.a)(this,"target",[0,0,0]),Object(s.a)(this,"offset",[0,0,0]),Object(s.a)(this,"radius",5),Object(s.a)(this,"_targetRadius",5),Object(s.a)(this,"_updateWheel",!1),this.cameraPos=t,this.up=e,this._addEvents()}_addEvents(){m.a.addEventListener("mousedown",t=>this._down(t)),m.a.addEventListener("mousemove",t=>this._move(t)),document.addEventListener("mouseup",t=>this._up(t)),m.a.addEventListener("mousewheel",t=>this._onWheel(t)),m.a.addEventListener("DOMMouseScroll",t=>this._onWheel(t))}_down(t){this._mousedown=!0,_(t,this._mouse),_(t,this._preMouse),this._preRx=this._targetRx,this._preRy=this._targetRy}_move(t){if(this._mousedown){_(t,this._mouse);let e=(this._mouse.x-this._preMouse.x)/this._width,i=(this._mouse.y-this._preMouse.y)/this._height;this._targetRx=this._preRx+e*Math.PI*2*this.sensitivity,this._targetRy=this._preRy+i*Math.PI*this.sensitivity}}_up(t){this._mousedown=!1}updateMatrix(){this._rx+=.1*(this._targetRx-this._rx),Math.abs(this._targetRx-this._rx)<b&&(this._rx=this._targetRx),this._ry+=.1*(this._targetRy-this._ry),Math.abs(this._targetRy-this._ry)<b&&(this._ry=this._targetRy),this._updateWheel&&(this.radius+=.1*(this._targetRadius-this.radius),Math.abs(this._targetRadius-this.radius)<b&&(this.radius=this._targetRadius)),this.cameraPos[1]=Math.sin(this._ry)*this.radius;let t=Math.abs(Math.cos(this._ry)*this.radius);this.cameraPos[0]=Math.cos(this._rx+.5*Math.PI)*t,this.cameraPos[2]=Math.sin(this._rx+.5*Math.PI)*t,this.cameraPos=[this.cameraPos[0]+this.offset[0],this.cameraPos[1]+this.offset[1],this.cameraPos[2]+this.offset[2]],g.a.lookAt(this._tmp,this.cameraPos,this.target,this.up)}_onWheel(t){const e=t.wheelDelta,i=t.detail;let s=0;s=i?e?e/i/40*i>0?1:-1:-i/3:e/120,this._targetRadius=this.radius+2*-s,this._targetRadius<=1&&(this._targetRadius=1),this._updateWheel=!0}get viewMatrix(){return this._tmp}set rx(t){this._targetRx=t}}var v=i(36);i.d(e,"default",function(){return T});class T{constructor(){Object(s.a)(this,"rotateQ",g.b.create()),Object(s.a)(this,"camera",new E),Object(s.a)(this,"_params",{}),Object(s.a)(this,"gui",new v.a({width:300})),this.init(),this.attrib(),this.prepare(),this._setGUI(),this._animate=this.animate.bind(this)}init(){}compile(t,e){let i=new p(m.d);return i.compile(t,e),i}attrib(){}uniform(){}prepare(){}animate(){requestAnimationFrame(this._animate),this.camera.updateMatrix(),this.uniform(),this.render()}render(){}play(){this.animate()}_setGUI(){}addGUIParams(t){return Object.assign(this._params,t)}get params(){return this._params}set params(t){throw Error("Params has no setter,please use addGUIParams")}}},69:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nin   vec2 TexCoords;\nout vec4 outColor;\nuniform sampler2D texture;\nuniform float lod;\nvoid main(void){\n\n    outColor = textureLod(texture, TexCoords, lod);\n}\n"},7:function(t,e,i){"use strict";i.d(e,"a",function(){return a}),i.d(e,"b",function(){return h});var s=function(t){switch(t){case 5120:case 5121:return 1;case 5122:case 5123:return 2;case 5124:case 5125:case 5126:return 4;default:return 0}},r=function(t){t.drawPoints=function(t,e){this.draw(0,t,e)},t.drawLines=function(t,e){this.draw(1,t,e)},t.drawLineLoop=function(t,e){this.draw(2,t,e)},t.drawLineStrip=function(t,e){this.draw(3,t,e)},t.drawTriangles=function(t,e){this.draw(4,t,e)},t.drawTriangleStrip=function(t,e){this.draw(5,t,e)},t.drawTriangleFan=function(t,e){this.draw(6,t,e)}},n=34962;function a(t,e,i){this.gl=t,this.usage=i||t.STATIC_DRAW,this.buffer=t.createBuffer(),this.attribs=[],this.stride=0,this.byteLength=0,this.length=0,e&&this.data(e)}a.prototype={bind:function(){this.gl.bindBuffer(n,this.buffer)},attrib:function(t,e,i,r){return this.attribs.push({name:t,type:0|i,size:0|e,normalize:!!r,offset:this.stride}),this.stride+=s(i)*e,this._computeLength(),this},data:function(t){var e=this.gl;e.bindBuffer(n,this.buffer),e.bufferData(n,t,this.usage),e.bindBuffer(n,null),this.byteLength=void 0===t.byteLength?t:t.byteLength,this._computeLength()},subData:function(t,e){var i=this.gl;i.bindBuffer(n,this.buffer),i.bufferSubData(n,e,t),i.bindBuffer(n,null)},attribPointer:function(t,e){var i=this.gl;if(i.bindBuffer(n,this.buffer),e&&e.length)for(let r=0;r<e.length;r++)for(var s=0;s<this.attribs.length;s++){let n=this.attribs[s];if(e[r]===n.name)if(void 0!==t[n.name]){let e=t[n.name]();i.enableVertexAttribArray(e),i.vertexAttribPointer(e,n.size,n.type,n.normalize,this.stride,n.offset)}else console.warn(`glBuffer can't get Attribute "${n.name}" Location.`)}else for(var r=0;r<this.attribs.length;r++){var a=this.attribs[r];if(void 0!==t[a.name]){var h=t[a.name]();i.enableVertexAttribArray(h),i.vertexAttribPointer(h,a.size,a.type,a.normalize,this.stride,a.offset)}else console.warn(`glBuffer can't get Attribute "${a.name}" Location.`)}},draw:function(t,e,i){e=void 0===e?this.length:e,this.gl.drawArrays(t,i,0|e)},dispose:function(){this.gl&&this.gl.deleteBuffer(this.buffer),this.buffer=null,this.gl=null},_computeLength:function(){this.stride>0&&(this.length=this.byteLength/this.stride)}},r(a.prototype);function h(t,e,i,s){this.gl=t,this.buffer=t.createBuffer(),this.usage=s||t.STATIC_DRAW,this.type=0,this.typeSize=0,this.size=0,this.setType(e||t.UNSIGNED_SHORT),i&&this.data(i)}h.prototype={bind:function(){this.gl.bindBuffer(34963,this.buffer)},setType:function(t){this.type=t,this.typeSize=s(t)},data:function(t){var e=this.gl;e.bindBuffer(34963,this.buffer),e.bufferData(34963,t,this.usage),e.bindBuffer(34963,null),this.size=void 0===t.byteLength?t:t.byteLength},subData:function(t,e){var i=this.gl;i.bindBuffer(34963,this.buffer),i.bufferSubData(34963,e,t),i.bindBuffer(34963,null)},dispose:function(){this.gl.deleteBuffer(this.buffer),this.buffer=null,this.gl=null},draw:function(t,e,i){e=void 0===e?this.size/this.typeSize:e,this.gl.drawElements(t,e,this.type,0|i)}},r(h.prototype)},70:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 outColor;\nvoid main()\n{\n  outColor = vec4(0.04, 0.28, 0.26, 1.0);\n}\n"}}]);