import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/skybox/skybox.vert'
import fs from 'shaders/skybox/skybox.frag'
import GLCubeTexture from 'libs/GLCubeTexture'
import HDRParser from 'libs/loaders/HDRParser'
import OBJLoader from 'libs/loaders/OBJLoader'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

export default class EnvMap extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
    this.skybox = Geom.skybox(30)

  }
  prepare() {
    let irr_posx = HDRParser(getAssets.irradiancePosX);
    let irr_negx = HDRParser(getAssets.irradianceNegX);
    let irr_posy = HDRParser(getAssets.irradiancePosY);
    let irr_negy = HDRParser(getAssets.irradianceNegY);
    let irr_posz = HDRParser(getAssets.irradiancePosZ);
    let irr_negz = HDRParser(getAssets.irradianceNegZ);

    this.irradianceMap = new GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz])
    this.venus = new OBJLoader().parseObj(getAssets.venus)
    this.camera.radius = 20

  }
  uniform() {

    mat4.perspective(this.pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, 11.1, 100)

    mat4.multiply(this.tmpMatrix, this.pMatrix, this.vMatrix)

    let mMatrix = mat4.identity(mat4.create())
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap.texture)

    this.prg.use()
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      tex: 0
    })
  }
  render() {

    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.prg.use()
    this.skybox.bind(this.prg, ['position'])
    this.skybox.draw()

    let mMatrix = mat4.identity(mat4.create())
    mat4.translate(mMatrix, mMatrix, [0,-5, 0])
    mat4.multiply(this.mvpMatrix, this.tmpMatrix, mMatrix)
    this.prg.style({
      mvpMatrix: this.mvpMatrix,
      tex: 0
    })
    for(let i =0; i < this.venus.length; i++){
      this.venus[i].bind(this.prg, ['position'])
      this.venus[i].draw()
    }
  }
}

