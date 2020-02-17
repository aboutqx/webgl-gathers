import Pipeline from '../PipeLine'
import vs from 'shaders/bloom/bloom.vert'
import fs from 'shaders/bloom/bloom.frag'
import blurFs from 'shaders/bloom/blur.frag'
import finalFs from 'shaders/bloom/bloom_final.frag'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  GlTools,
  canvas
} from 'libs/GlTools'
import Geom from 'libs/Geom'
import CustomShaders from 'libs/shaders/CustomShaders'
import FrameBuffer from 'libs/FrameBuffer'
import FboPingPong from 'libs/FboPingPong'

export default class Bloom extends Pipeline {
  count = 0
  constructor() {
    super()
    gl.getExtension("EXT_color_buffer_float")
  }
  init() {
    this.prg = this.compile(vs, fs)
    this.blurPrg = this.compile(CustomShaders.bigTriangleVert, blurFs)
    this.finalPrg = this.compile(CustomShaders.bigTriangleVert, finalFs)
  }
  attrib() {
    this.statue = Geom.cube(1)
    this.quad = Geom.bigTriangle()
  }
  prepare(){
    this.camera.radius = 3.5
    let fbo = new FrameBuffer(canvas.width, canvas.height, { internalFormat: gl.RGBA16F, type:gl.FLOAT }, 2)

    this.hdrFb = fbo.frameBuffer
    this.textures = fbo.textures

    this.pingpongFbo = new FboPingPong(canvas.width, canvas.height, { internalFormat: gl.RGBA16F, type:gl.FLOAT })
    

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    

  }
  _setGUI() {
    this.addGUIParams({
      texOffsetScale: 1,
      blurPassCount: 20,
      lightScale: 1,
      uAlpha: .5
    })
    this.gui.add(this.params, 'texOffsetScale', 0, 4).step(.02)
    this.gui.add(this.params, 'blurPassCount', 1, 40).step(1)
    this.gui.add(this.params, 'lightScale', .1, 10).step(.1)
    this.gui.add(this.params, 'uAlpha', 0, 1.0).step(.1)
  }
  uniform() {
    let mMatrix = mat4.identity(mat4.create())

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)
  }
  
  renderScene(){
    let a =[10, 20, 10]
    let b = a.map(x => x* this.params.lightScale)
    this.prg.use()
    this.prg.style({
      'lights[0].Position' : [1.5, 0, 0],
      'lights[0].Color': b,
      'lights[1].Position' : [-1.5, 0, 0],
      'lights[1].Color': b,
      'lights[2].Position' : [0, 1.5, -2],
      'lights[2].Color': b,
      'lights[3].Position' : [0, 0, 2.],
      'lights[3].Color': [10,20,10],
      'lights[4].Position' : [0, -1.5, 0.],
      'lights[4].Color': [10,20,10],
      baseColor:[0., 0.3, 0.3],
      uAlpha: this.params.uAlpha
    })
    this.statue.rotationY = 12
    GlTools.draw(this.statue)
  }

  render() {
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFb)
      GlTools.clear(0,0,0)
      gl.cullFace(gl.FRONT)
      this.renderScene()
      gl.cullFace(gl.BACK)
      this.renderScene()
    
     gl.bindFramebuffer(gl.FRAMEBUFFER, null)


    this.blurPrg.use()
    let horizontal = true, first_iteration = true, amount = this.params.blurPassCount
    for(let i =0; i< amount; i++){
      this.pingpongFbo.write.bind()
      if(first_iteration) {
        this.textures[1].bind()
      }
      else  this.pingpongFbo.read.textures[0].bind()
      this.blurPrg.uniform('image', 'uniform1i', 0)
      this.blurPrg.style({
        horizontal,
        texOffsetScale: this.params.texOffsetScale
      })

      GlTools.draw(this.quad)
      horizontal = !horizontal;
      this.pingpongFbo.swap()
      if (first_iteration) first_iteration = false;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    GlTools.clear(0,0,0)
    this.finalPrg.use()
    this.textures[0].bind(0)
    this.pingpongFbo.read.textures[0].bind(1)
    this.finalPrg.uniform('scene', 'uniform1i', 0)
    this.finalPrg.uniform('bloomBlur', 'uniform1i', 1)
    this.finalPrg.style({
      bloom: true,
      exposure: .1
    })

    GlTools.draw(this.quad)

  }
}


