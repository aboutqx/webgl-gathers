import Pipeline from '../PipeLine'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'
import vs from 'shaders/ibl_final/pbr_ibl.vert'
import fs from 'shaders/ibl_final/pbr_ibl.frag'
import mapFs from 'shaders/ibl_final/pbr_map.frag'
import cubeVs from 'shaders/ibl_final/cubemap.vert'
import cubeFs from 'shaders/ibl_final/equirectangular_to_cubemap.frag'
import skyboxVs from 'shaders/ibl_final/skybox.vert'
import skyboxFs from 'shaders/ibl_final/skybox.frag'
import prefilterFs from 'shaders/ibl_final/prefilter.frag'
import simple2dVs from 'shaders/ibl_final/simple2d.vert'
import brdfFs from 'shaders/ibl_final/brdf.frag'
import irradianceFs from 'shaders/ibl_final/irradiance_convolution.frag'

import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import Vao from 'libs/vao'
import {
  Sphere,
  CubeData
} from '../Torus'
import {
  mat4,
  vec3
} from 'gl-matrix'
import Mesh from 'libs/Mesh'
import Texture from 'libs/glTexture'
import HDRParser from 'libs/loaders/HDRParser'

export default class IblFinal extends Pipeline {
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
    // this.mapPrg = this.compile(vs, mapFs)
    this.cubePrg = this.compile(cubeVs, cubeFs)
    this.skyboxPrg = this.compile(skyboxVs, skyboxFs)
    this.prefilterPrg = this.compile(cubeVs, prefilterFs)
    this.brdfPrg = this.compile(simple2dVs, brdfFs)
    this.irradiancePrg = this.compile(cubeVs, irradianceFs)
  }
  attrib() {
    let {
      pos,
      index,
      normal,
      uv
    } = Sphere(256, 256, .15)

    let sphere = new Mesh()
    sphere.bufferVertex(pos)
    sphere.bufferIndex(index)
    sphere.bufferNormal(normal)
    sphere.bufferTexCoord(uv)
    this.sphere = sphere

    let cube = new Mesh()
    cube.bufferData(CubeData, ['position', 'normal', 'texCoord'], [3, 3, 2])
    this.cube = cube

    let planeVertices = [
      // positions          // texture Coords (note we set these higher than 1 (together with GL_REPEAT as texture wrapping mode). this will cause the floor texture to repeat)
      3.0, -0.5, 3.0, 1.0, 0.0,
      -3.0, -0.5, 3.0, 0.0, 0.0,
      -3.0, -0.5, -3.0, 0.0, 1.0,

      3.0, -0.5, 3.0, 1.0, 0.0,
      -3.0, -0.5, -3.0, 0.0, 1.0,
      3.0, -0.5, -3.0, 1.0, 1.0
    ]

    this.planeBuffer = new ArrayBuffer(gl, new Float32Array(planeVertices))

    this.planeBuffer.attrib('position', 3, gl.FLOAT)
    this.planeBuffer.attrib('texCoord', 2, gl.FLOAT)

    this.planeVao = new Vao(gl)
    this.planeVao.setup(this.cubePrg, [this.planeBuffer])

    let quad = new Mesh()
    let quadData = [
      -1.0, 1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0, 0.0,
      1.0, 1.0, 0.0, 1.0, 1.0,
      1.0, -1.0, 0.0, 1.0, 0.0
    ]
    quad.bufferData(quadData, ['position', 'texCoord'], [3, 2])
    this.quad = quad
  }
  prepare() {

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
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

    let hdrInfo = HDRParser(getAssets.equirectangular)
    console.log('hdrInfo', hdrInfo)
    this.hdrTexture = new Texture(gl)
    gl.bindTexture(gl.TEXTURE_2D, this.hdrTexture.id)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, hdrInfo.shape[0], hdrInfo.shape[1], 0, gl.RGBA, gl.FLOAT, hdrInfo.data)
    this.hdrTexture.clamp()


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

      this.cube.bind(this.cubePrg, ['position', 'texCoord'])
      this.cube.draw()
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP) // has to be placed here，to generate each face data

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      console.log(`gl.checkFramebufferStatus() returned ${status.toString(16)}`);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // irradiance map
    let irradianceMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, irradianceMap)
    for (var i = 0; i < 6; i++) {
      //r,l,u,d,b,f 为6个面指定空数据
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, 32, 32, 0, gl.RGBA, gl.FLOAT, null)
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    this.irradianceMap = irradianceMap

    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
    gl.viewport(0, 0, 32, 32);
    this.irradiancePrg.use()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture); // 放在这，防止new cubeframebuffer时绑定了tetxure0到null

    for (let i = 0; i < 6; i++) {
      mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
      mat4.multiply(vpMatrix, pMatrix, vMatrix)
      this.irradiancePrg.style({
        environmentMap: 0,
        vpMatrix,
        mMatrix: mMatrix
      })
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.irradianceMap, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      this.cube.bind(this.irradiancePrg, ['position', 'texCoord'])
      this.cube.draw()
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // prefilter map
    this.prefilterMap = gl.createTexture();
    let prefilterSize = 128
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap);

    for (var i = 0; i < 6; i++) {
      //r,l,u,d,b,f 为6个面指定空数据
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA32F, prefilterSize, prefilterSize, 0, gl.RGBA, gl.FLOAT, null)
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP)

    this.prefilterPrg.use()
    let maxMipLevels = 5
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture); // 放在这，防止new cubeframebuffer时绑定了tetxure0到null

    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
    for (let mip = 0; mip < maxMipLevels; mip++) {
      let mipWidth = 128 * Math.pow(.5, mip)
      let mipHeight = mipWidth
      gl.viewport(0, 0, mipWidth, mipHeight)
      let roughness = mip / (maxMipLevels - 1)
      for (let i = 0; i < 6; i++) {

        mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
        mat4.multiply(vpMatrix, pMatrix, vMatrix)
        this.prefilterPrg.style({
          environmentMap: 0,
          vpMatrix,
          mMatrix: mMatrix,
          roughness
        })
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.prefilterMap, mip);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        this.cube.bind(this.prefilterPrg, ['position', 'texCoord'])
        this.cube.draw()
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    //brdf lookup texture
    this.brdfLUTTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, 512, 512, 0, gl.RG, gl.FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.brdfLUTTexture, 0);
    gl.viewport(0, 0, 512, 512)
    this.brdfPrg.use()
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.quad.bind(this.brdfPrg)
    this.quad.draw(gl.TRIANGLE_STRIP)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
  uniform() {

    let vMatrix = mat4.create()
    let pMatrix = mat4.create()

    this.tmpMatrix = mat4.create()

    let eyeDirection = []
    let camUpDirection = []

    vec3.transformQuat(eyeDirection, [0.0, 0.0, 1.0], this.rotateQ)
    vec3.transformQuat(camUpDirection, [0.0, 1.0, 0.0], this.rotateQ)
    this.eyeDirection = eyeDirection

    mat4.lookAt(vMatrix, eyeDirection, [0, 0, 0], camUpDirection)
    mat4.perspective(pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)
    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)


  }
  _setGUI() {
    this.addGUIParams({
      roughness: 0.2,
      metallic: 6 / 7,
      lambertDiffuse: true,
      orenNayarDiffuse: false,
      map: 'none',
    })

    let folder = this.gui.addFolder('material param')
    folder.add(this.params, 'roughness', 0.05, 1).step(0.01)
    folder.add(this.params, 'metallic', 0, 6 / 7).step(0.01)
    folder.open()

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
    this.texture0 = new Texture(gl).fromImage(getAssets[map + 'Albedo'])
    this.texture1 = new Texture(gl).fromImage(getAssets[map + 'Roughness'])
    this.texture2 = new Texture(gl).fromImage(getAssets[map + 'Metallic'])
    this.texture3 = new Texture(gl).fromImage(getAssets[map + 'Ao'])
    this.texture4 = new Texture(gl).fromImage(getAssets[map + 'Normal'])
  }

  render() {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.3, 0.3, 0.3, 1.);
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    let mMatrix = mat4.create()
    let baseUniforms = {
      vpMatrix: this.tmpMatrix,
      mMatrix: mMatrix,
      lightPositions: [ // use flatten array for gl.uniform3fv
        -10., 10., 10.,
        10., 10., 10.,
        -10., -10., 10.,
        10., -10., 10.,
      ],
      lightColors: new Array(12).fill(300.),
      camPos: this.eyeDirection,
      lambertDiffuse: this.params.lambertDiffuse,
      irradianceMap: 0
    }

    if (this.params.map === 'none') {
      this.prg.use()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceMap)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, this.brdfLUTTexture);
      this.prg.style({
        ...baseUniforms,
        albedo: [.5, .0, .0],
        roughness: this.params.roughness,
        metallic: this.params.metallic,
        ao: 1.,
        irradianceMap: 0,
        prefilterMap: 1,
        brdfLUT: 2
      })
      this.sphere.bind(this.prg, ['position', 'normal'])
    } else {
      this.mapPrg.use()

      this.texture0.bind(0)
      this.texture1.bind(1)
      this.texture2.bind(2)
      this.texture3.bind(3)
      this.texture4.bind(4)
      this.mapPrg.style({
        ...baseUniforms,
        albedoMap: 0,
        roughnessMap: 1,
        metallicMap: 2,
        aoMap: 3,
        normalMap: 4
      })
      this.sphere.bind(this.mapPrg)
    }

    this.sphere.draw()

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
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.prefilterMap)

    this.skyboxPrg.style({
      environmentMap: 0,
      vpMatrix: this.tmpMatrix,
      mMatrix: mMatrix,
    })
    this.cube.bind(this.skyboxPrg, ['position'])
    this.cube.draw()

    // brdf out为vec2，设置为vec4时显示正常
    // this.brdfPrg.use()
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // this.quad.bind(this.brdfPrg)
    // this.quad.draw(gl.TRIANGLE_STRIP)
  }
}
