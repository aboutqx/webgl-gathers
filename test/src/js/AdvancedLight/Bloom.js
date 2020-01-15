import Pipeline from '../PipeLine'
import vs from 'shaders/bloom/bloom.vert'
import fs from 'shaders/bloom/bloom.frag'
import blurVs from 'shaders/bloom/blur.vert'
import blurFs from 'shaders/bloom/blur.frag'
import finalVs from 'shaders/bloom/quad.vert'
import finalFs from 'shaders/bloom/bloom_final.frag'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  GlTools,
  canvas
} from 'libs/GlTools'
import Fbo from 'libs/glFbo'
import Geom from 'libs/Geom'

export default class Bloom extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
    this.blurPrg = this.compile(blurVs, blurFs)
    this.finalPrg = this.compile(finalVs, finalFs)
  }
  attrib() {
    this.statue = getAssets.statue
    this.quad = Geom.bigTriangle()
  }
  prepare(){
    this.camera.radius = 3.5
    let { hdrFbo, textures } = frameBufferMrt(canvas.width, canvas.height, 2)
    gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFbo)
    gl.drawBuffers([ gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1])
    gl.bindFramebuffer(gl.FRAMEBUFFER, 0)

    this.hdrFbo = hdrFbo
  }

  uniform() {

    let mMatrix = mat4.identity(mat4.create())

    let invMatrix = mat4.identity(mat4.create())
    mat4.invert(invMatrix, mMatrix)
  }
  render() {
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFbo)
    GlTools.clear()


    this.prg.use()
    for(let i =0;i<this.statue.length;i++){
      this.statue[i].bind()
      GlTools.draw(this.statue[i])
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, 0)

    this.finalPrg.use()
    this.finalPrg.style({
      tex
    })
    this.quad.bind()
    GlTools.draw(this.quad)

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
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_FLOATCOMPONENT16, width, height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
      frameBuffer,
      renderbuffer: depthRenderBuffer,
      textures
  };
}