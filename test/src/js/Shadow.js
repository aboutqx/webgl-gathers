import Pipeline from './PipeLine'
import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import Texture from 'libs/glTexture'
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'
import outlineFs from 'shaders/maskOutline.frag'
import {
  mat4
} from 'gl-matrix'
import Vao from 'libs/vao'


export default class Shadow extends Pipeline {
  count = 0
  constructor(gl) {
    super(gl)
  }
  init() {
    this.outlinePrg = this.compile(vs, outlineFs)
    this.prg = this.compile(vs, fs)
  }
  attrib() {
    let gl = this.gl

    this.cubeBuffer = new ArrayBuffer(gl, new Float32Array(cubeVertices))
    this.planeBuffer = new ArrayBuffer(gl, new Float32Array(planeVertices))

    this.cubeBuffer.attrib('position', 3, gl.FLOAT)
    this.cubeBuffer.attrib('texcoord', 2, gl.FLOAT)


    this.planeBuffer.attrib('position', 3, gl.FLOAT)
    this.planeBuffer.attrib('texcoord', 2, gl.FLOAT)

    this.planeVao = new Vao(gl)
    this.planeVao.setup(this.prg, [this.planeBuffer])

    this.cubeVao = new Vao(gl)
    this.cubeVao.setup(this.prg, [this.cubeBuffer])

    this.texture = new Texture(gl, gl.RGBA)
    let img = getAssets.koala
    this.texture.fromImage(img)
    this.texture.setFilter()
    this.texture.repeat()

    this.texture.bind(0)
  }
  prepare() {

    let vMatrix = mat4.identity(mat4.create())
    let pMatrix = mat4.identity(mat4.create())

    this.mvpMatrix = mat4.identity(mat4.create())
    this.tmpMatrix = mat4.identity(mat4.create())

    mat4.lookAt(vMatrix, [0.0, 0.0, 4.0], [0, 0, 0.0], [0, 1, 0])
    let canvas = this.gl.canvas

    mat4.perspective(pMatrix, 45, canvas.clientWidth / canvas.clientHeight, .1, 1000)

    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)

    let gl = this.gl

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE) //double side

  }
  uniform() {
    let mMatrix = mat4.identity(mat4.create())

    this.count++

      let rad = (this.count % 360) * Math.PI / 180

    mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 1])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)


    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      texture: 0
    })
  }
  render() {
    let gl = this.gl
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

    gl.stencilMask(0x00) //写入0

    this.prg.use()
    this.planeVao.bind()
    this.planeBuffer.drawTriangles()
    this.planeVao.unbind()

    gl.stencilFunc(gl.ALWAYS, 1, 0xff)
    gl.stencilMask(0xff) //写入1
    this.cubeVao.bind()
    this.cubeBuffer.drawTriangles()
    this.cubeVao.unbind()

    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff); //不等于1的才能通过测试
    gl.stencilMask(0x00); //写入0
    this.outlinePrg.use()
    const scale = 1.1;

    let mMatrix = mat4.identity(mat4.create())

    let rad = (this.count % 360) * Math.PI / 180 //不旋转看到的会是一个mask方面

    mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 1])
    mat4.scale(mMatrix, mMatrix, [scale, scale, scale])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.outlinePrg.style({
      mvpMatrix: this.mvpMatrix
    })
    this.cubeVao.bind()
    this.cubeBuffer.drawTriangles()
    this.cubeVao.unbind()
    gl.stencilMask(0xff)
  }
}
