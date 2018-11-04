import Pipeline from '../PipeLine'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'
import vs from 'shaders/deferred_shading/finalQuad.vert'
import fs from 'shaders/deferred_shading/finalQuad.frag'
import gBufferVs from 'shaders/deferred_shading/gBuffer.vert'
import gBufferFs from 'shaders/deferred_shading/gBuffer.frag'
import fboVs from 'shaders/deferred_shading/fbo_debug.vert'
import fboFs from 'shaders/deferred_shading/fbo_debug.frag'
import skyboxVs from 'shaders/ibl_final/skybox.vert'
import skyboxFs from 'shaders/ibl_final/skybox.frag'

import {
  CubeData
} from '../Torus'
import {
  mat4
} from 'gl-matrix'
import Mesh from 'libs/Mesh'
import Texture from 'libs/glTexture'
import OBJLoader from 'libs/loaders/OBJLoader'
import MTLLoader from 'libs/loaders/MTLLoader'
const offset = 10.
const objectPositions = [
  [-offset, -offset, -offset],
  [0.0, -offset, -offset],
  [offset, -offset, -offset],
  [-offset, -offset, 0.0],
  [0.0, -offset, 0.0],
  [offset, -offset, 0.0],
  [-offset, -offset, offset],
  [0.0, -offset, offset],
  [offset, -offset, offset]
]
export default class DeferredShading extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    // use webgl2
    // gl.getExtension('OES_standard_derivatives')
    // gl.getExtension('OES_texture_float')
    gl.getExtension('OES_texture_float_linear') // Even WebGL2 requires OES_texture_float_linear
    gl.getExtension("EXT_color_buffer_float")
    // // gl.getExtension('OES_texture_half_float')
    // gl.getExtension('OES_texture_half_float_linear')
    // gl.getExtension('EXT_shader_texture_lod')
    // this.prg = this.compile(vs, fs)
    this.gBufferPrg = this.compile(gBufferVs, gBufferFs)
    this.fboPrg = this.compile(fboVs, fboFs)
    this.skyboxPrg = this.compile(skyboxVs, skyboxFs)

  }
  async attrib() {
    let cube = new Mesh()
    cube.bufferData(CubeData, ['position', 'normal', 'texCoord'], [3, 3, 2])
    this.cube = cube

    let quad = new Mesh()
    let quadData = [
      -1.0, 1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0, 0.0,
      1.0, 1.0, 0.0, 1.0, 1.0,
      1.0, -1.0, 0.0, 1.0, 0.0
    ]
    quad.bufferData(quadData, ['position', 'texCoord'], [3, 2])
    this.quad = quad

    const materials = await new MTLLoader('nanosuit.mtl', './assets/models/nanosuit').parse(getAssets.nanosuitMTL)
    this.nanosuit = new OBJLoader().parseObj(getAssets.nanosuit, materials)
    console.log(this.nanosuit)
  }
  prepare() {
    gl.clearColor(0., 0., 0., 1.);
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    //position, normal, AlbedoSpec(diffuse, specular indensity)
    this.mrt = framebufferMRT(canvas.width, canvas.height, ['32f', '32f', 'rgba'])


    // execute once
    this.camera.target = [0, -1., 0]
    this.camera.offset = [1, 3., 0]
    this.camera.radius = 8
  }
  uniform() {

    this.vMatrix = this.camera.viewMatrix
    this.pMatrix = mat4.identity(mat4.create())

    mat4.perspective(this.pMatrix, toRadian(60), canvas.clientWidth / canvas.clientHeight, .1, 100)

  }

  render() {

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.mrt.frameBuffer)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      this.gBufferPrg.use()

      if (this.nanosuit) { // loaded
        this.gBufferPrg.style({
          vMatrix: this.vMatrix,
          pMatrix: this.pMatrix
        })
        for(let i =0 ;i < objectPositions.length; i++) {
          let mMatrix = mat4.identity(mat4.create())
          mat4.scale(mMatrix, mMatrix, [.25, .25, .25])
          mat4.translate(mMatrix, mMatrix, objectPositions[i])

          this.gBufferPrg.style({
            mMatrix
          })
          for (let i = 0; i < this.nanosuit.length; i++) {
            this.nanosuit[i].bind(this.gBufferPrg, ['position', 'normal', 'texCoord'])
            this.nanosuit[i].draw()
          }
        }
      }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.mrt.texture[1])
    this.fboPrg.use()
    this.fboPrg.style({
      fboAttachment: 0
    })
    this.quad.bind(this.fboPrg, ['position', 'texCoord'])
    this.quad.draw(gl.TRIANGLE_STRIP)
  }
}
function framebufferMRT(width, height, type) {
  let frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

  let fTexture = []
  const bufferList = []
  for (let i = 0; i < type.length; ++i) {
    fTexture[i] = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fTexture[i])
    if(type[i] === '32f') {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, fTexture[i], 0)
    bufferList.push(gl.COLOR_ATTACHMENT0 + i)
  }
  gl.drawBuffers(bufferList) // 指定渲染目标

  const depthRenderBuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer)

  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return {
    frameBuffer: frameBuffer,
    depthBuffer: depthRenderBuffer,
    texture: fTexture
  }
}
/*
while (...) // 游戏循环
{
  // 1. 几何处理阶段：渲染所有的几何/颜色数据到G缓冲
  glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  gBufferShader.Use();
  for (Object obj: Objects) {
    ConfigureShaderTransformsAndUniforms();
    obj.Draw();
  }
  // 2. 光照处理阶段：使用G缓冲计算场景的光照
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  glClear(GL_COLOR_BUFFER_BIT);
  lightingPassShader.Use();
  BindAllGBufferTextures();
  SetLightingUniforms();
  RenderQuad();
}

*/
