import Pipeline from './PipeLine'
import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'
import mrtVs from 'shaders/mrt/mrt.vert'
import mrtFs from 'shaders/mrt/mrt.frag'
import vs from 'shaders/mrt/simple.vert'
import fs from 'shaders/mrt/simple.frag'

import {
  mat4
} from 'gl-matrix'
import Vao from 'libs/vao'
import {
  Torus,
  hsva
} from './Torus'

let mrtStatus = {
  color_attachments: 0,
  draw_buffers: 0
}
let ext
let frameBuffer

export default class Mrt extends Pipeline {
  count = 0
  offset = [
    [-0.5, -0.5, 0.0],
    [-0.5, 0.5, 0.0],
    [0.5, -0.5, 0.0],
    [0.5, 0.5, 0.0]
  ]

  constructor() {
    super()

  }
  init() {
    ext = gl.getExtension('WEBGL_draw_buffers')
    if (!ext) {
      alert('WEBGL_draw_buffers not supported')
      return
    } else {
      mrtStatus.color_attachments = gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL)
      mrtStatus.draw_buffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL)
      console.log('MAX_COLOR_ATTACHMENTS_WEBGL: ' + mrtStatus.color_attachments)
      console.log('MAX_DRAW_BUFFERS_WEBGL: ' + mrtStatus.draw_buffers)
    }

    this.mrtPrg = this.compile(mrtVs, mrtFs)
    this.prg = this.compile(vs, fs)
  }

  attrib() {
    let {
      pos,
      index,
      normal,
      color
    } = Torus(64, 64, 1.0, 2.0, [1.0, 1.0, 1.0, 1.0])

    const tPosBuffer = new ArrayBuffer(gl, new Float32Array(pos))
    const tNormalBuffer = new ArrayBuffer(gl, new Float32Array(normal))
    const tColorBuffer = new ArrayBuffer(gl, new Float32Array(color))

    this.indexBuffer = new IndexBuffer(gl, gl.UNSIGNED_SHORT, new Uint16Array(index), gl.STATIC_DRAW)

    tPosBuffer.attrib('position', 3, gl.FLOAT)
    tNormalBuffer.attrib('normal', 3, gl.FLOAT)
    tColorBuffer.attrib('color', 4, gl.FLOAT)

    this.torusVao = new Vao(gl)
    this.torusVao.setup(this.mrtPrg, [tPosBuffer, tNormalBuffer, tColorBuffer])

    let vPos = [-0.5, 0.5, 0.0,
      0.5, 0.5, 0.0,
      -0.5, -0.5, 0.0,
      0.5, -0.5, 0.0
    ]
    let vTexCoord = [
      0.0, 1.0,
      1.0, 1.0,
      0.0, 0.0,
      1.0, 0.0
    ]
    let vIndex = [
      0, 2, 1,
      2, 3, 1
    ]

    const vPosBuffer = new ArrayBuffer(gl, new Float32Array(vPos))
    const vTexBuffer = new ArrayBuffer(gl, new Float32Array(vTexCoord))

    this.vIndexBuffer = new IndexBuffer(gl, gl.UNSIGNED_SHORT, new Uint16Array(vIndex), gl.STATIC_DRAW)

    vPosBuffer.attrib('position', 3, gl.FLOAT)
    vTexBuffer.attrib('texCoord', 2, gl.FLOAT)
    this.mainVao = new Vao(gl)
    this.mainVao.setup(this.prg, [vPosBuffer, vTexBuffer])
  }

  prepare() {

    let vMatrix = mat4.create()
    let pMatrix = mat4.create()

    this.mvpMatrix = mat4.create()
    this.tmpMatrix = mat4.create()

    const eyePosition = [0.0, 80.0, 0.0]
    const camUpDirection = [0., 0., -1.]

    mat4.lookAt(vMatrix, eyePosition, [0, 0, 0], camUpDirection)
    let canvas = this.gl.canvas
    mat4.perspective(pMatrix, toRadian(75), canvas.clientWidth / canvas.clientHeight, .1, 135)
    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)


    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE) //double side

    gl.clearColor(.3, .3, .7, 1.0)
    gl.clearDepth(1.0)


    frameBuffer = createFramebufferMRT(gl, gl.canvas.width, gl.canvas.height) //full canvas size

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.t[0])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.t[1])
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.t[2])
    gl.activeTexture(gl.TEXTURE3)
    gl.bindTexture(gl.TEXTURE_2D, frameBuffer.t[3])
    //z值为pespecte之后的z，camera从上往下看，z相同，所以depth里圆圈颜色相同，转动后，透视z值改变，颜色改变
  }
  uniform() {

  }
  render() {

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.f)

    const bufferList = [
      ext.COLOR_ATTACHMENT0_WEBGL,
      ext.COLOR_ATTACHMENT1_WEBGL,
      ext.COLOR_ATTACHMENT2_WEBGL,
      ext.COLOR_ATTACHMENT3_WEBGL
    ]
    ext.drawBuffersWEBGL(bufferList) // 指定渲染目标
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const lightDirection = [-0.577, 0.577, 0.577]

    let mMatrix = mat4.create()
    let invMatrix = mat4.create()
    this.count++
    let rad = (this.count % 360) * Math.PI / 180

    this.mrtPrg.use()
    this.torusVao.bind()
    this.indexBuffer.bind()
    for (let i = 0; i < 9; i++) {
      mat4.identity(mMatrix);
      //绕y轴旋转，改变model坐标系方向，便于后续移动错开
      mat4.rotate(mMatrix, mMatrix, i * 2 * Math.PI / 9, [0, 1, 0])
      mat4.translate(mMatrix, mMatrix, [0.0, 0.0, 10.0])
      mat4.rotate(mMatrix, mMatrix, rad, [1, 1, 0])
      mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

      mat4.invert(invMatrix, mMatrix)

      let ambient = hsva(i * 40, 1.0, 1.0, 1.0)//hue 0-360为各常见色彩

      this.mrtPrg.style({
        lightDirection,
        mvpMatrix: this.mvpMatrix,
        ambient,
        invMatrix
      })
      this.indexBuffer.drawTriangles()
    }
    this.torusVao.unbind()
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.prg.use()
    this.mainVao.bind()
    this.vIndexBuffer.bind()
    for (let i = 0; i < 4; ++i) {
      this.prg.style({
        offset: this.offset[i],
        texture: i
      })
      this.vIndexBuffer.drawTriangles()
    }
    this.mainVao.unbind()
  }
}

//链接纹理到framebuffer
function createFramebufferMRT(gl, width, height) {
  let frameBuffer = gl.createFramebuffer()

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

  let fTexture = []

  for (let i = 0; i < 4; ++i) {
    fTexture[i] = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fTexture[i])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, fTexture[i], 0)
  }

  let depthRenderBuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer)

  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return {
    f: frameBuffer,
    d: depthRenderBuffer,
    t: fTexture
  }
}
