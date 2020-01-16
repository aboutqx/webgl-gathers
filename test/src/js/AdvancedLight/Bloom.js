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
    this.statue = getAssets.statue
    this.quad = Geom.bigTriangle()
  }
  prepare(){
    this.camera.radius = 3.5
    let fbo = new FrameBuffer(canvas.width, canvas.height, { internalFormat: gl.RGBA16F, type:gl.FLOAT }, 2)

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer)
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])

    this.hdrFbo = fbo.frameBuffer
    this.textures = fbo.textures

    let { pingpongFBO, pingpongColorbuffers } = pingpongFrameBuffer(canvas.width, canvas.height)
    this.pingpongFBO = pingpongFBO
    this.pingpongColorbuffers = pingpongColorbuffers

  }

  uniform() {

    let mMatrix = mat4.identity(mat4.create())

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)
  }
  render() {
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFbo)
    GlTools.clear(0,0,0)

    this.prg.use()
    this.prg.style({
      'lights[0].Position' : [.5, 0, 0],
      'lights[0].Color': [10, 10, 10],
      'lights[1].Position' : [-.5, 0, 0],
      'lights[1].Color': [10, 10, 10],
      'lights[2].Position' : [0, 1, 0],
      'lights[2].Color': [10, 10, 10],
      baseColor:[0.3, 0.3, 0]
    })
    
    GlTools.draw(this.statue)
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)


    this.blurPrg.use()
    let horizontal = true, first_iteration = true, amount = 10
    for(let i =0; i< amount; i++){
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pingpongFBO[Number(horizontal)])
      if(first_iteration) {
        this.textures[1].bind()
      }
      else  gl.bindTexture(gl.TEXTURE_2D, this.pingpongColorbuffers[Number(!horizontal)])
      this.blurPrg.uniform('image', 'uniform1i', 0)
      this.blurPrg.style({
        horizontal
      })

      GlTools.draw(this.quad)
      horizontal = !horizontal;
      if (first_iteration) first_iteration = false;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    GlTools.clear(0,0,0)
    this.finalPrg.use()
    this.textures[0].bind(0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.pingpongColorbuffers[1])
    this.finalPrg.uniform('scene', 'uniform1i', 0)
    this.finalPrg.uniform('bloomBlur', 'uniform1i', 1)
    this.finalPrg.style({
      bloom: true,
      exposure: .1
    })

    GlTools.draw(this.quad)

  }
}

function pingpongFrameBuffer(width, height){
  const pingpongFBO = []
  const pingpongColorbuffers = []
  for(let i=0; i< 2; i++){
    pingpongFBO[i] = gl.createFramebuffer()
    pingpongColorbuffers[i] = gl.createTexture()
    gl.bindFramebuffer(gl.FRAMEBUFFER, pingpongFBO[i])
    gl.bindTexture(gl.TEXTURE_2D, pingpongColorbuffers[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pingpongColorbuffers[i], 0);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return {
    pingpongFBO,
    pingpongColorbuffers
  }
}

function frameBufferMrt(width, height ,count){
  let frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  let textures = [];
  for(let i = 0; i < count; ++i){
      textures[i] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, textures[i], 0);
  }
  let depthRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
      frameBuffer,
      depthRenderBuffer,
      textures
  };
}