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
import { bigTriangleVert } from 'libs/shaders/CustomShaders'
import FrameBuffer from 'libs/FrameBuffer'

const shadowWidth = 1024
const shadowHeight = 1024
const lightPos = [0, 4, -1]


export default class Shadow extends Pipeline {
  count = 0
  constructor() {
    super()
  }
  init() {

    this.prg = this.compile(vs, fs)
    this.depthQuadPrg = this.compile(bigTriangleVert, depthQuadFs)
    this.shadowPrg = this.compile(shadowMappingVs, shadowMappingFs)

  }
  attrib() {

    this.plane = Geom.plane(30, 30, 1, 'xz')
    this.cube = Geom.cube(1)
    this.quad = Geom.bigTriangle()

  }

  prepare() {
    // gl.getExtension("WEBGL_depth_texture")
    let lightView = mat4.create()
    let lightProjection = mat4.create()
    this.tmpMatrix = mat4.create()

    const nearPlane = .1
    const farPlane = 18.5
    // out, left, right, bottom, top, near, far
    mat4.ortho(lightProjection, -25, 25, -25, 25, nearPlane, farPlane)
    mat4.lookAt(lightView, lightPos, [0, 0, 0], [0, 1, 0])
    mat4.multiply(this.tmpMatrix, lightProjection, lightView)


    this._fboDepth = new FrameBuffer(shadowWidth, shadowHeight, {}, 0)
    this.orbital.radius = 11

    this.wood = getAssets.wood
    this.wood.bind()
    this.wood.repeat()

  }
  uniform() {

  }

  render() {
    this._fboDepth.bind()
    GlTools.clear()
    this.prg.use()
    this.prg.style({
      lightSpaceMatrix: this.tmpMatrix
    })
    this._renderScene(this.prg)
    this._fboDepth.unbind()

    gl.viewport(0, 0, canvas.width, canvas.height)

    // for debug
    this.frameBufferGUI.textureList = [{ texture: this._fboDepth.depthTexture }]

    this.shadowPrg.use()
    this.shadowPrg.style({
      diffuseTexture: this.wood,
      shadowMap: this._fboDepth.depthTexture,
      lightPos,
      lightSpaceMatrix: this.tmpMatrix,
    })
    this._renderScene(this.shadowPrg)
  }

  _renderScene(shader) {
    this.mMatrix = mat4.create()
    mat4.translate(this.mMatrix, this.mMatrix, [0, -2, 0])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.plane)

    this.mMatrix = mat4.create()
    mat4.translate(this.mMatrix, this.mMatrix, [-1.2, 0, 5])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)

    this.mMatrix = mat4.create()
    mat4.translate(this.mMatrix, this.mMatrix, [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)

    this.mMatrix = mat4.create()
    mat4.translate(this.mMatrix, this.mMatrix, [-2.2, .4, 1])
    mat4.rotate(this.mMatrix, this.mMatrix, toRadian(30), [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    GlTools.draw(this.cube)
  }
}

/*
  // 1. 渲染深度贴图
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
