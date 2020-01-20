import Pipeline from '../PipeLine'
import {
  gl, GlTools, toRadian, canvas
} from 'libs/GlTools'
import vs from 'shaders/shadow/depth.vert'
import fs from 'shaders/shadow/depth.frag'
import depthQuadFs from 'shaders/shadow/depthQuad.frag'
import shadowMappingVs from 'shaders/shadow/shadowMapping.vert'
import shadowMappingFs from 'shaders/shadow/shadowMapping.frag'
import {
  mat4
} from 'gl-matrix'
import Geom from 'libs/Geom'
import CustomShaders from 'libs/shaders/CustomShaders'

const shadowWidth = 1024
const shadowHeight = 1024
const lightPos = [0, 4, -1]
let vMatrix = mat4.identity(mat4.create())

export default class Shadow extends Pipeline {
  count = 0
  constructor() {
    super()
  }
  init() {

    this.prg = this.compile(vs, fs)
    this.depthQuadPrg = this.compile(CustomShaders.bigTriangleVert, depthQuadFs)
    this.shadowPrg = this.compile(shadowMappingVs, shadowMappingFs)
    // flip texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }
  attrib() {

    this.plane = Geom.plane(30, 30 ,1, 'xz')
    this.cube = Geom.cube(1)
    this.quad = Geom.bigTriangle()
  }

  prepare() {
    // gl.getExtension("WEBGL_depth_texture")
    let lightView = mat4.identity(mat4.create())
    let lightProjection = mat4.identity(mat4.create())
    this.tmpMatrix = mat4.identity(mat4.create())

    const nearPlane = .1
    const farPlane = 18.5
    // out, left, right, bottom, top, near, far
    mat4.ortho(lightProjection, -25, 25, -25, 25, nearPlane, farPlane)
    mat4.lookAt(lightView, lightPos, [0, 0, 0], [0, 1, 0])
    mat4.multiply(this.tmpMatrix, lightProjection, lightView)

    gl.enable(gl.DEPTH_TEST);
    //gl.cullFace(gl.FRONT_AND_BACK)
    gl.clearColor(0.3, 0.3, .3, 1.0)


    this.depthBuffer = depthTextureFbo(shadowWidth, shadowHeight)
    this.camera.radius = 11

    this.wood = getAssets.wood
    this.wood.bind()
    this.wood.repeat()
  }
  uniform() {
    vMatrix = this.camera.viewMatrix

  }
  render() {
    gl.viewport(0, 0, shadowWidth, shadowHeight)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthBuffer.frameBuffer)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      this.prg.use()
      this.prg.style({
        lightSpaceMatrix: this.tmpMatrix
      })
      this._renderScene(this.prg)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.depthBuffer.depthTexture)
    // for debug
    // this.depthQuadPrg.use()
    // this.depthQuadPrg.uniform('depthMap', 'uniform1i', 0)
    // GlTools.draw(this.quad)

    this.shadowPrg.use()
    this.shadowPrg.uniform('shadowMap', 'uniform1i', 1)
    this.shadowPrg.style({
      diffuseTexture: this.wood,
      lightPos,
      viewPos: this.camera.cameraPos,
      mMatrix: this.mMatrix,
      pMatrix: this.camera.projMatrix,
      vMatrix,
      lightSpaceMatrix: this.tmpMatrix,
    })
    this._renderScene(this.shadowPrg)
  }

  _renderScene(shader) {
    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [0, -2, 0])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.plane)

    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [-1.2, 0, 5])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)

    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)

    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [-2.2, .4, 1])
    mat4.rotate(this.mMatrix, this.mMatrix, toRadian(30), [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)
  }
}
function depthTextureFbo (width, height) {
  const frameBuffer = gl.createFramebuffer()
  const depthTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, depthTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  const borderColor= [ 1.0, 1.0, 1.0, 1.0 ]
  // gl.texParameterfv(gl.TEXTURE_2D, gl.TEXTURE_BORDER_COLOR, borderColor)

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return {
    frameBuffer,
    depthTexture
  }
}
/*
  // 1. 首选渲染深度贴图
  glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
  glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
  glClear(GL_DEPTH_BUFFER_BIT);
  ConfigureShaderAndMatrices();
  RenderScene();
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  // 2. 像往常一样渲染场景，但这次使用深度贴图
  glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  ConfigureShaderAndMatrices();
  glBindTexture(GL_TEXTURE_2D, depthMap);
  RenderScene();
*/
