import Pipeline from '../PipeLine'
import {
  gl,
  toRadian,
  canvas,
  GlTools
} from 'libs/GlTools'
import vs from 'shaders/pbr_flow/pbr_ibl.vert'
import fs from 'shaders/pbr_flow/pbr_ibl.frag'
import mapFs from 'shaders/pbr_flow/pbr_map.frag'
import cubeVs from 'shaders/ibl_final/cubemap.vert'
import cubeFs from 'shaders/ibl_final/equirectangular_to_cubemap.frag'
import skyboxVs from 'shaders/ibl_final/skybox.vert'
import skyboxFs from 'shaders/ibl_final/skybox.frag'
import simple2dVs from 'shaders/ibl_final/simple2d.vert'
import brdfFs from 'shaders/ibl_final/brdf.frag'
import Geom from 'libs/Geom'

import {
  mat4,
  vec3
} from 'gl-matrix'
import Texture from 'libs/glTexture'
import GLCubeTexture from 'libs/GLCubeTexture'

const nrRows = 7
const nrColumns = 7
const spacing = .42
/* irradianceMap, prefilterMap 用cmftStudio生成

*/
export default class PbrFlow extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    // use webgl2
    // gl.getExtension('OES_standard_derivatives')
    // gl.getExtension('OES_texture_float')
    gl.getExtension('OES_texture_float_linear') // Even WebGL2 requires OES_texture_float_linear
    gl.getExtension("EXT_color_buffer_float")
    // // gl.getExtension('OES_texture_half_float')
    // gl.getExtension('OES_texture_half_float_linear')
    // gl.getExtension('EXT_shader_texture_lod')
    this.prg = this.compile(vs, fs)
    this.mapPrg = this.compile(vs, mapFs)
    this.cubePrg = this.compile(cubeVs, cubeFs)
    this.skyboxPrg = this.compile(skyboxVs, skyboxFs)
    this.brdfPrg = this.compile(simple2dVs, brdfFs)
  }
  attrib() {
    this.sphere = Geom.sphere(2, 100)


    this.cube = Geom.cube(2)

    this.plane = Geom.plane()

    this.quad = Geom.plane()

  }
  prepare() {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    let pMatrix = mat4.create()
    let mMatrix = mat4.create()
    let vMatrix = mat4.create()
    let vpMatrix = mat4.create()

    mat4.perspective(pMatrix, toRadian(90), 1., .1, 100)
    const CAMERA_SETTINGS = [
      [vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0)],
      [vec3.fromValues(0, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0)],
      [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)],
      [vec3.fromValues(0, 0, 0), vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1)],
      [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0)],
      [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0)]
    ]


    this.hdrTexture = getAssets.equirectangular
    //this.hdrTexture.clamp()


    // cubemap
    let cubemapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture)
    for (var i = 0; i < 6; i++) {
      //r,l,u,d,b,f 为6个面指定空数据
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 512, 512, 0, gl.RGBA, gl.FLOAT, null)
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.cubemapTexture = cubemapTexture


    this.cubePrg.use()
    this.hdrTexture.bind(0)

    gl.viewport(0, 0, 512, 512)
    let captureFrameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)

    for (let i = 0; i < 6; i++) {
      mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
      mat4.multiply(vpMatrix, pMatrix, vMatrix)
      this.cubePrg.style({
        equirectangularMap: 0,
        vpMatrix,
        mMatrix: mMatrix
      })
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemapTexture, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      GlTools.draw(this.cube)
    }


    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      console.log(`gl.checkFramebufferStatus() returned ${status.toString(16)}`);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)


    //brdf lookup texture
    this.brdfLUTTexture = new Texture(gl, gl.RG).fromData(512, 512, null, gl.RG32F)
    this.brdfLUTTexture.bind()
    this.brdfLUTTexture.clamp()

    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.brdfLUTTexture.id, 0);
    gl.viewport(0, 0, 512, 512)
    this.brdfPrg.use()
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    GlTools.draw(this.quad)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
console.log(getAssets)

    this.irradianceMap = getAssets.outputiem
    this.prefilterMap = GLCubeTexture.parseDDS(getAssets.radiance)
  }
  uniform() {

    this.vMatrix = mat4.create()
    this.pMatrix = mat4.create()
    this.tmpMatrix = mat4.create()

    let eyeDirection = []
    let camUpDirection = []

    vec3.transformQuat(eyeDirection, [0.0, 0., 3.], this.rotateQ)
    vec3.transformQuat(camUpDirection, [0.0, 1.0, 0.0], this.rotateQ)
    this.eyeDirection = eyeDirection

    mat4.lookAt(this.vMatrix, eyeDirection, [0, 0, 0], camUpDirection)
    mat4.perspective(this.pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)
    mat4.multiply(this.tmpMatrix, this.pMatrix, this.vMatrix)
  }
  _setGUI() {
    this.addGUIParams({
      lambertDiffuse: true,
      orenNayarDiffuse: false,
      map: 'none',
    })

    let folder1 = this.gui.addFolder('diffuse model')
    folder1.add(this.params, 'lambertDiffuse').listen().onChange(() => {
      this.setChecked('lambertDiffuse')
    })
    folder1.add(this.params, 'orenNayarDiffuse').listen().onChange(() => {
      this.setChecked('orenNayarDiffuse')
    })
    folder1.open()

    let folder2 = this.gui.addFolder('material map')
    folder2.add(this.params, 'map', ['none', 'plastic', 'wall', 'gold', 'grass', 'rusted_iron', 'wood']).listen().onChange(() => {
      this.setTexture()
    })
    folder2.open()

  }

  setChecked(prop) {
    this.params.lambertDiffuse = false
    this.params.orenNayarDiffuse = false
    this.params[prop] = true
  }

  setTexture() {
    let map = this.params.map
    if (map === 'none') return
		this.texture0 = getAssets[map + 'Albedo']
		this.texture1 = getAssets[map + 'Roughness']
		this.texture2 = getAssets[map + 'Metallic']
		this.texture3 = getAssets[map + 'Ao']
		this.texture4 = getAssets[map + 'Normal']
  }

  render() {
    gl.viewport(0, 0, canvas.width, canvas.height)
    GlTools.clear()

    let mMatrix = mat4.create()
    let baseUniforms = {
      vpMatrix: this.tmpMatrix,
      lightPositions: [ // use flatten array for gl.uniform3fv
        -10., 10., 10.,
        10., 10., 10.,
        -10., -10., 10.,
        10., -10., 10.,
      ],
      lightColors: new Array(12).fill(300.),
      camPos: this.eyeDirection,
      lambertDiffuse: this.params.lambertDiffuse
    }

    if (this.params.map === 'none') {
      this.prg.use()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap.texture)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap.texture)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture.id);
      this.prg.style({
        ...baseUniforms,
        albedo: [.5, .0, .0],
        ao: 1.,
        irradianceMap: 0,
        prefilterMap: 1,
        brdfLUT: 2
      })

      for (let row = 0; row < nrRows; row++) {
        this.prg.style({
          metallic: row / nrRows
        })
        for (let col = 0; col < nrColumns; col++) {
          mat4.translate(mMatrix, mat4.create(), [(col - (nrColumns / 2)) * spacing, (row - (nrRows / 2)) * spacing, 0.0])
          // mat4.translate(mMatrix, mMatrix, [1, 0, 0])
          this.prg.style({
            roughness: clamp(col / nrColumns, 0.05, 1.),
            mMatrix
          })
          Gltools.draw(this.sphere)
        }
      }
    } else {
      this.mapPrg.use()


      gl.activeTexture(gl.TEXTURE5)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap.texture)
      gl.activeTexture(gl.TEXTURE6)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap.texture)
      gl.activeTexture(gl.TEXTURE7)
      gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture);
      mat4.scale(mMatrix, mMatrix, [2, 2, 2])
      this.mapPrg.style({
        ...baseUniforms,
        mMatrix: mMatrix,
				albedoMap: this.texture0,
				roughnessMap: this.texture1,
				metallicMap: this.texture2,
				aoMap: this.texture3,
				normalMap: this.texture4,
        irradianceMap: 5,
        prefilterMap: 6,
        brdfLUT: 7
      })
      Gltools.draw(this.sphere)
    }

    // this.cubePrg.use()
    // this.hdrTexture.bind(0)
    // this.cubePrg.style({
    //   equirectangularMap: 0,
    //   vpMatrix: this.tmpMatrix,
    //   mMatrix: mMatrix
    // })
    // this.cube.bind(this.cubePrg, ['position', 'texCoord'])
    // this.cube.draw()

    // this.planeVao.bind()
    // this.planeBuffer.drawTriangles()
    // this.planeVao.unbind()

    this.skyboxPrg.use()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture)

    this.skyboxPrg.style({
      environmentMap: 0,
      vMatrix: this.vMatrix,
      pMatrix: this.pMatrix,
      mMatrix: mat4.create(),
    })
    Gltools.draw(this.cube)

    // brdf out为vec2，设置为vec4时显示正常
    // this.brdfPrg.use()
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // this.quad.bind(this.brdfPrg)
    // this.quad.draw(gl.TRIANGLE_STRIP)
  }
}
function clamp(value, min, max) {
  if (min > max) {
    return clamp(value, max, min);
  }

  if (value < min) return min;
  else if (value > max) return max;
  else return value;
}
