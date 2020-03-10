import Pipeline from '../PipeLine'
import FrameBuffer from 'libs/FrameBuffer'
import terrainVs from 'shaders/water/terrain.vert'
import terrainFs from 'shaders/water/terrain.frag'
import waterVs from 'shaders/water/water.vert'
import waterFs from 'shaders/water/water.frag'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import Geom from 'libs/Geom'
import {
  mat4,
  vec3
}from 'gl-matrix'
import {
  gl,
  canvas,
  GlTools
}from 'libs/GlTools'

export default class Color extends Pipeline {
  count = 0
  constructor() {
    super()
    GlTools.applyHdrExtension()
  }
  init() {
    this.terrainPrg = this.compile(terrainVs, terrainFs)
    this.waterPrg = this.compile(waterVs, waterFs)
  }
  attrib() {
    this.skybox = new BatchSkyBox(400, getAssets.outputskybox)

    const size = 150
    this.terrainPlane = Geom.plane(size ,size, 100 , 'xz')
    this.waterPlane = Geom.plane(size - 50 ,size - 50, 100 , 'xz')
  }
  prepare() {
    this.camera.radius = 100
    this.camera.offset = [0, 12, 18]

    this.terrainTexture = getAssets.terrain
    this.terrainTexture.bind()
    this.terrainTexture.repeat()


    let fbo = new FrameBuffer(canvas.width, canvas.height, { internalFormat: gl.RGBA16F, type:gl.HALF_FLOAT,minFilter:gl.LINEAR,maxFilter:gl.LINEAR })
    this.hdrFb = fbo.frameBuffer
    this.textures = fbo.textures
  }
  uniform() {
    let mMatrix = mat4.create()
    
    this.terrainPrg.use()
    this.terrainPrg.style({
      mMatrix,
      texture0: this.terrainTexture
    })

    mMatrix = mat4.create()
    
    this.waterPrg.use()
    this.waterPrg.style({
      mMatrix
    })
    
  }

  _renderScene(){
    this.skybox.render()

    this.terrainPrg.use()
    GlTools.draw(this.terrainPlane)


  }

  render() {
    GlTools.clear()

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdrFb)
    GlTools.clear(0,0,0)

    this.camera.flipY()
    this._renderScene()
  
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)


    this.camera.flipY()
    this.frameBufferGUI.textureList = [{ texture: this.textures[0], flipY:true }]
    this._renderScene()
    this.waterPrg.use()
    this.waterPrg.style({
      reflectionTetxture: this.textures[0]
    })
    GlTools.draw(this.waterPlane)

  }
}
