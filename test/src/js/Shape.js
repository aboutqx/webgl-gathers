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
import Texture from 'libs/glTexture'
import vs from 'shaders/base.vert'
import fs from 'shaders/base.frag'
import { mat4 } from 'gl-matrix'
import Vao from 'libs/vao'


export default class Mask extends Pipeline {
  count = 0
  constructor() {
    super()
  }
  init(){
    this.prg = this.compile(vs, fs)
    // flip texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }
  attrib() {

    let planeVertices = [
        // positions          // texture Coords (note we set these higher than 1 (together with GL_REPEAT as texture wrapping mode). this will cause the floor texture to repeat)
         3.0, -0.5,  3.0,  1.0, 0.0,
        -3.0, -0.5,  3.0,  0.0, 0.0,
        -3.0, -0.5, -3.0,  0.0, 1.0,

         3.0, -0.5,  3.0,  1.0, 0.0,
        -3.0, -0.5, -3.0,  0.0, 1.0,
         3.0, -0.5, -3.0,  1.0, 1.0
    ]

    this.planeBuffer = new ArrayBuffer(gl, new Float32Array(planeVertices))

    this.planeBuffer.attrib('position', 3, gl.FLOAT)
    this.planeBuffer.attrib('texcoord', 2, gl.FLOAT)

    this.planeVao = new Vao(gl)
    this.planeVao.setup(this.prg, [this.planeBuffer])


    this.texture = new Texture(gl, gl.RGBA)
    let img = getAssets.splash
    this.texture.fromImage(img)
    this.texture.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  prepare() {

    let vMatrix = mat4.identity(mat4.create())
    let pMatrix = mat4.identity(mat4.create())

    this.mvpMatrix = mat4.identity(mat4.create())
    this.tmpMatrix = mat4.identity(mat4.create())

    mat4.lookAt(vMatrix, [0.0, 0.0, 4.0], [0, 0, 0.0], [0, 1, 0])

    mat4.perspective(pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 1000)

    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)


  }
  uniform() {
    let mMatrix = mat4.identity(mat4.create())

    this.count++

    let rad = (this.count % 360) * Math.PI / 180

    mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 1])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)


    this.prg.use()
    this.texture.bind(0)

    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      tex: 0
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT)



    this.prg.use()
    this.planeVao.bind()
    this.planeBuffer.drawTriangles()
    this.planeVao.unbind()


  }
}
