import Pipeline from '../PipeLine'
import {
  gl, canvas
} from 'libs/GlTools'
import vs from 'shaders/mirror/simple.vert'
import fs from 'shaders/mirror/simple.frag'
import mVs from 'shaders/mirror/mirror.vert'
import mFs from 'shaders/mirror/mirror.frag'
import {
  Torus
} from '../Torus'
import {
  mat4, vec3
} from 'gl-matrix'
import Fbo from 'libs/glFbo'
import Mesh from 'libs/Mesh'

export default class DepthOfField extends Pipeline {
  count = 0
  ortMatrix = mat4.identity(mat4.create())
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
    this.mPrg = this.compile(mVs, mFs)
  }
  attrib() {
    let {
      pos,
      index,
      normal,
      color
    } = Torus(64, 64, 0.2, 0.7)

    let torus = new Mesh()
    torus.bufferVertex(pos)
    torus.bufferIndex(index)
    torus.bufferNormal(normal)
    torus.bufferColor(color)
    this.torus = torus

    let position = [
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]
    color = [
      0.3, 0.5, 0.5, 1.0,
      0.5, 0.5, 0.1, 1.0,
      0.5, 0.5, 0.1, 1.0,
      0.5, 0.5, 0.1, 1.0
    ]
    let texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]
    index = [
      0, 2, 1,
      1, 2, 3
    ]

    let plane = new Mesh()
    plane.bufferVertex(position)
    plane.bufferIndex(index)
    plane.bufferTexCoord(texCoord)
    plane.bufferColor(color)
    this.plane = plane
  }
  prepare () {
    this.fbo = new Fbo(gl)
    this.fbo.resize(512, 512)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)

  }
  uniform() {

    let vMatrix = mat4.identity(mat4.create())
    let pMatrix = mat4.identity(mat4.create())

    this.tmpMatrix = mat4.identity(mat4.create())

    let eyeDirection = []
    let camUpDirection = []

    vec3.transformQuat(eyeDirection, [0.0, 5.0, 5.0], this.rotateQ)
    vec3.transformQuat(camUpDirection, [0.0, 1.0, -1.0], this.rotateQ)
    this.eyeDirection = eyeDirection

    mat4.lookAt(vMatrix, eyeDirection, [0, 0, 0], camUpDirection)
    mat4.perspective(pMatrix, 45, canvas.clientWidth / canvas.clientHeight, .1, 100)
    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)

    mat4.lookAt(vMatrix, [0.0, 0.0, .1], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0])
    mat4.ortho(pMatrix, - 1.0, 1.0, -1.0, 1.0, 0.1, 1.)
    mat4.multiply(this.ortMatrix, pMatrix, vMatrix)

  }
  render() {

    this.fbo.bind()
    this.fbo.clear()
    gl.clearColor(0.3, 0.8, 0.4, 0.3);
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.cullFace(gl.FRONT)

    let mMatrix = mat4.identity(mat4.create())
    mat4.rotate(mMatrix, mMatrix, 1 * 2 * Math.PI / 9, [0, 1, 0])

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)

    this.prg.use()
    this.prg.style({
      vpMatrix: this.tmpMatrix,
      mMatrix: mMatrix,
      invMatrix,
      lightDirection: [0., -0.5, 0.577],
      eyeDirection: this.eyeDirection,
      ambientColor: [0., 0., 0., 0.0],
      mirror: true
    })
    this.torus.bind(this.prg)
    this.torus.draw()

    this.fbo.unbind()

    gl.clearColor(0.0, 0.7, 0.7, 1.0);
    gl.clearDepth(1.0);
    gl.clearStencil(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

    gl.cullFace(gl.BACK)

    // this.torus.bind(this.prg)
    // this.torus.draw()

    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.ALWAYS, 1, ~0);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE); // 只有通过深度测试和模板测试时才替换为1

    mMatrix = mat4.identity(mMatrix)
    mat4.translate(mMatrix, mMatrix, [0.0, 1., 0.0])
    mat4.scale(mMatrix, mMatrix, [1.7,1.7,1.7])
    mat4.rotate(mMatrix, mMatrix,  Math.PI * 1.5 , [1, 0, 0])
    mat4.invert(invMatrix, mMatrix)
    this.prg.style({
      mMatrix: mMatrix,
      invMatrix
    })
    this.plane.bind(this.prg, ['position', 'color', 'normal'])
    this.plane.draw()


    gl.stencilFunc(gl.EQUAL, 1, ~0); // 等于1才通过,不然正交投影会到整个屏幕
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)


    this.mPrg.use()
    this.fbo.bindColor(this.mPrg.texture(), 0)

    this.mPrg.style({
      alpha: .9,
      texture: 0,
      ortMatrix: this.ortMatrix
    })

    this.plane.bind(this.mPrg, ['position', 'texCoord'])
    // this.plane.draw(gl.LINE_STRIP)
    this.plane.draw()
    gl.disable(gl.STENCIL_TEST)
  }
}
