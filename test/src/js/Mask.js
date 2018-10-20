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
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'
import outlineFs from 'shaders/maskOutline.frag'
import { mat4 } from 'gl-matrix'
import Vao from 'libs/vao'


export default class Mask extends Pipeline {
  count = 0
  constructor() {
    super()
  }
  init(){
    this.outlinePrg = this.compile(vs, outlineFs)
    this.prg = this.compile(vs, fs)
    // flip texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }
  attrib() {
    let cubeVertices = [
        // positions          // texture Coords
        -0.5, -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 0.0,

        -0.5, -0.5,  0.5,  0.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,

        -0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5, -0.5,  1.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5,  1.0, 0.0,

         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,

        -0.5, -0.5, -0.5,  0.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 1.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
        -0.5, -0.5,  0.5,  0.0, 0.0,
        -0.5, -0.5, -0.5,  0.0, 1.0,

        -0.5,  0.5, -0.5,  0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0
    ]
    let planeVertices = [
        // positions          // texture Coords (note we set these higher than 1 (together with GL_REPEAT as texture wrapping mode). this will cause the floor texture to repeat)
         3.0, -0.5,  3.0,  1.0, 0.0,
        -3.0, -0.5,  3.0,  0.0, 0.0,
        -3.0, -0.5, -3.0,  0.0, 1.0,

         3.0, -0.5,  3.0,  1.0, 0.0,
        -3.0, -0.5, -3.0,  0.0, 1.0,
         3.0, -0.5, -3.0,  1.0, 1.0
    ]

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
    this.texture.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  _setGUI() {
    this.addGUIParams({
      lod: 5.,
      LINEAR_MIPMAP_LINEAR: false,
      NEAREST_MIPMAP_NEAREST: true
    })

    let folder = this.gui.addFolder('tetxureLod lod param')
    folder.add(this.params, 'lod', 1., Math.log2(512)).step(1.)
    folder.open()

    let folder1 = this.gui.addFolder('TEXTURE_MIN_FILTER')
    folder1.add(this.params, 'LINEAR_MIPMAP_LINEAR').listen().onChange(() => {
      this.setChecked('LINEAR_MIPMAP_LINEAR')
    })
    folder1.add(this.params, 'NEAREST_MIPMAP_NEAREST').listen().onChange(() => {
      this.setChecked('NEAREST_MIPMAP_NEAREST')
    })
    folder1.open()
  }
  setChecked(val){
    this.texture.bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[val]);
    this.params.LINEAR_MIPMAP_LINEAR = false
    this.params.NEAREST_MIPMAP_NEAREST = false
    this.params[val] = true
  }
  prepare() {

    let vMatrix = mat4.identity(mat4.create())
    let pMatrix = mat4.identity(mat4.create())

    this.mvpMatrix = mat4.identity(mat4.create())
    this.tmpMatrix = mat4.identity(mat4.create())

    mat4.lookAt(vMatrix, [0.0, 0.0, 4.0], [0, 0, 0.0], [0, 1, 0])

    mat4.perspective(pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 1000)

    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

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
      texture: 0,
      lod: this.params.lod
    })
  }
  render() {

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

    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);//不等于1的才能通过测试
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
