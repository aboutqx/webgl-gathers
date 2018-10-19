import Pipeline from './PipeLine'
import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import vs from 'shaders/reflection.vert'
import fs from 'shaders/reflection.frag'
import { Torus } from './Torus'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

export default class Reflection extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
    let {
      pos,
      index,
      normal,
      color
    } = Torus(32, 32, 1.0, 2.0)

    this.posBuffer = new ArrayBuffer(gl, new Float32Array(pos))
    this.normalBuffer = new ArrayBuffer(gl, new Float32Array(normal))
    this.colorBuffer = new ArrayBuffer(gl, new Float32Array(color))

    this.prg.use()

    this.posBuffer.attrib('position', 3, gl.FLOAT)
    this.posBuffer.attribPointer(this.prg)

    this.normalBuffer.attrib('normal', 3, gl.FLOAT)
    this.normalBuffer.attribPointer(this.prg)


    this.colorBuffer.attrib('color', 4, gl.FLOAT)
    this.colorBuffer.attribPointer(this.prg)

    this.indexBuffer = new IndexBuffer(gl, gl.UNSIGNED_SHORT, new Uint16Array(index), gl.STATIC_DRAW)

  }
  prepare() {

    let vMatrix = mat4.identity(mat4.create())
    let pMatrix = mat4.identity(mat4.create())

    this.mvpMatrix = mat4.identity(mat4.create())
    this.tmpMatrix = mat4.identity(mat4.create())

    mat4.lookAt(vMatrix, [0.0, 0.0, 15.0], [0, 0, 0], [0, 1, 0])
    let canvas = this.gl.canvas

    mat4.perspective(pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)

    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)

  }
  uniform() {
    let mMatrix = mat4.identity(mat4.create())

    // this.count++

    let rad = (this.count % 360) * Math.PI / 180
    mat4.rotate(mMatrix, mMatrix, 1 * 2 * Math.PI / 9, [0, 1, 0])
    mat4.translate(mMatrix, mMatrix, [0.0, 0.0, -10.0])
    // mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 1])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)

    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      invMatrix,
      lightDirection: [-0.5, 0.5, 0.5],
      eyeDirection: [0.0, 0.0, 20.0],
      ambientColor: [0.1, 0.1, 0.1, 1.0]
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)

    this.prg.use()
    this.indexBuffer.bind()
    this.indexBuffer.drawTriangles()

  }
}

