import Pipeline from '../PipeLine'
import {
  gl, canvasWidth, canvasHeight, toRadian
} from 'libs/GlTools'
import Texture from 'libs/glTexture'
import vs from 'shaders/shadow/depth.vert'
import fs from 'shaders/shadow/depth.frag'
import quadVs from 'shaders/deferred_shading/finalQuad.vert'
import depthQuadFs from 'shaders/shadow/depthQuad.frag'
import shadowMappingVs from 'shaders/shadow/shadowMapping.vert'
import shadowMappingFs from 'shaders/shadow/shadowMapping.frag'
import {
  mat4
} from 'gl-matrix'
import { QuadData, CubeData } from '../Torus'
import Mesh from 'libs/Mesh'

const shadowWidth = 1024
const shadowHeight = 1024
const lightPos = [0, 4, -1]
let vMatrix = mat4.identity(mat4.create())
let pMatrix = mat4.identity(mat4.create())
export default class Shadow extends Pipeline {
  count = 0
  constructor() {
    super()
  }
  init() {

    this.prg = this.compile(vs, fs)
    this.depthQuadPrg = this.compile(quadVs, depthQuadFs)
    this.shadowPrg = this.compile(shadowMappingVs, shadowMappingFs)
    // flip texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }
  attrib() {
    let planeData = [
      // positions          // texture Coords (note we set these higher than 1 (together with GL_REPEAT as texture wrapping mode). this will cause the floor texture to repeat)
      30., -1.01, 30., 1.0, 0.0,
      -30., -1.01, 30., 0.0, 0.0,
      -30., -1.01, -30., 0.0, 1.0,

      30., -1.01, 30., 1.0, 0.0,
      -30., -1.01, -30., 0.0, 1.0,
      30., -1.01, -30., 1.0, 1.0
    ]
    this.plane = new Mesh()
    this.plane.bufferData(planeData, ['position', 'texCoord'], [3, 2])

    this.cube = new Mesh()
    this.cube.bufferData(CubeData, ['position', 'normal', 'texCoord'], [3, 3, 2])

    this.quad = new Mesh()
    this.quad.bufferData(QuadData, ['position', 'texCoord'], [3, 2])
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

    mat4.perspective(pMatrix, toRadian(60), canvasWidth / canvasHeight, .1, 100)

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clearColor(0.3, 0.3, .3, 1.0)


    this.depthBuffer = depthTextureFbo(shadowWidth, shadowHeight)
    this.camera.radius = 11

    this.wood = new Texture(gl).fromImage(getAssets.wood)
    this.wood.bind()
    this.wood.repeat()
  }
  uniform() {
    vMatrix = this.camera.viewMatrix

  }
  render() {
    gl.viewport(0, 0, shadowWidth, shadowHeight)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthBuffer.frameBuffer)
      gl.clear(gl.DEPTH_BUFFER_BIT)
      this.prg.use()
      this.prg.style({
        lightSpaceMatrix: this.tmpMatrix
      })
      this._renderScene(this.prg, ['position'])
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(0, 0, canvasWidth, canvasHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.depthBuffer.depthTexture)
    // for debug
    // this.depthQuadPrg.use()
    // this.depthQuadPrg.style({
    //   depthMap: 0
    // })
    // this.quad.bind(this.depthQuadPrg, ['position', 'texCoord'])
    // this.quad.draw(gl.TRIANGLE_STRIP)

    this.wood.bind(1)
    this.shadowPrg.use()
    this.shadowPrg.style({
      shadowMap: 0,
      diffuseTexture: 1,
      lightPos,
      viewPos: this.camera.cameraPos,
      mMatrix: this.mMatrix,
      pMatrix,
      vMatrix,
      lightSpaceMatrix: this.tmpMatrix,
    })
    this._renderScene(this.shadowPrg)
  }

  _renderScene(shader, arg) {
    this.mMatrix = mat4.identity(mat4.create())
    shader.style({
      mMatrix: this.mMatrix
    })
    this.plane.bind(shader, arg)
    this.plane.draw()

    mat4.translate(this.mMatrix, this.mMatrix, [-1.2, 0, 5])
    shader.style({
      mMatrix: this.mMatrix
    })
    this.cube.bind(shader, arg)
    this.cube.draw()

    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    this.cube.bind(shader, arg)
    this.cube.draw()

    this.mMatrix = mat4.identity(mat4.create())
    mat4.translate(this.mMatrix, this.mMatrix, [-2.2, .4, 1])
    mat4.rotate(this.mMatrix, this.mMatrix, toRadian(30), [2, 2, 4])
    shader.style({
      mMatrix: this.mMatrix
    })
    this.cube.bind(shader, arg)
    this.cube.draw()
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
