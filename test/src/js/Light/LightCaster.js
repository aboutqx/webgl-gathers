import Pipeline from '../PipeLine'
import Geom from 'libs/Geom'
import vs from 'shaders/light_caster/directionalLight.vert'
import fs from 'shaders/light_caster/directionalLight.frag'
import pointFs from 'shaders/light_caster/pointLight.frag'
import spotFs from 'shaders/light_caster/spotLight.frag'
import lampFs from 'shaders/light_caster/lamp.frag'
import lampVs from 'shaders/light_caster/lamp.vert'
import Texture from 'libs/glTexture'
import {
  mat4
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

let vMatrix = mat4.identity(mat4.create())
let pMatrix = mat4.identity(mat4.create())
const lightColor = [0.33, 0.42, 0.18]
const ligthPos = [0.2, -1.0, -0.3].map(v => v * 50)
const cubePosition = [
  [0.0, 0.0, 0.0],
  [2.0, 5.0, -15.0],
  [-1.5, -2.2, -2.5],
  [-3.8, -2.0, -12.3],
  [2.4, -0.4, -3.5],
  [-1.7, 3.0, -7.5],
  [1.3, -2.0, -2.5],
  [1.5, 2.0, -2.5],
  [1.5, 0.2, -1.5],
  [-1.3, 1.0, -1.5]
]
export default class LightCaster extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
    this.pointPrg = this.compile(vs, pointFs)
    this.spotPrg = this.compile(vs, spotFs)
    this.lampPrg = this.compile(lampVs, lampFs)
  }
  attrib() {

    this.cube = Geom.cube(1)

    this.lamp = Geom.s
  }
  prepare() {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)


    this.diffuseTexture = new Texture(gl, gl.RGBA).fromImage(getAssets.cubeDiffuse)
    this.specularTexture = new Texture(gl, gl.RGBA).fromImage(getAssets.cubeSpecular)
    this.emissionTexture = new Texture(gl, gl.RGBA).fromImage(getAssets.cubeEmission)

    this.camera.radius = 6
  }
  _setGUI() {
    this.addGUIParams({
      directionalLight: true,
      pointLight: false,
      spotLight: false
    })

    let folder1 = this.gui.addFolder('diffuse model')
    folder1.add(this.params, 'directionalLight').listen().onChange(() => {
      this.setChecked('directionalLight')
    })
    folder1.add(this.params, 'pointLight').listen().onChange(() => {
      this.setChecked('pointLight')
    })
    folder1.add(this.params, 'spotLight').listen().onChange(() => {
      this.setChecked('spotLight')
    })
    folder1.open()
  }

  setChecked(prop) {
    this.params.directionalLight = false
    this.params.pointLight = false
    this.params.spotLight = false
    this.params[prop] = true
  }

  uniform() {
    vMatrix = this.camera.viewMatrix
    mat4.perspective(pMatrix, toRadian(60), canvas.clientWidth / canvas.clientHeight, .1, 100)

  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.diffuseTexture.bind(0)
    this.specularTexture.bind(1)
    this.emissionTexture.bind(2)
    if (this.params.directionalLight) {
      this.prg.use()
      this.cube.bind(this.prg)
      this.prg.style({
        vMatrix,
        pMatrix,
        camPos: this.camera.cameraPos,
        'material.shininess': 30,
        'material.diffuse': 0,
        'material.specular': 1,
        'material.emission': 2,
        'light.ambient': [.2, .2, .2],
        'light.diffuse': [.5, .5, .5],
        'light.specular': [1., 1., 1.], // specular 还和视角有关
        'light.direction': [-ligthPos[0], -ligthPos[1], -ligthPos[2]] //光源方向为从光源出发，因此是坐标向量取负
      })
      cubePosition.map((position, i) => {
        let cubemMatrix = mat4.create()
        // mat4.scale(cubemMatrix, cubemMatrix, [.5, .5, .5])
        mat4.rotate(cubemMatrix, cubemMatrix, toRadian(20 * i), ligthPos)
        mat4.translate(cubemMatrix, cubemMatrix, position)
        this.prg.style({
          mMatrix: cubemMatrix
        })
        this.cube.draw()
      })
    } else if(this.params.pointLight) {
      this.pointPrg.use()
      this.cube.bind(this.pointPrg)

      this.pointPrg.style({
        vMatrix,
        pMatrix,
        camPos: this.camera.cameraPos,
        'material.shininess': 30,
        'material.diffuse': 0,
        'material.specular': 1,
        'material.emission': 2,
        'light.ambient': [.2, .2, .2],
        'light.diffuse': [.5, .5, .5],
        'light.specular': [1., 1., 1.],
        'light.position': [0, 0, 1],
        //衰减系数
        'light.constant': 1,
        'light.linear': .09,
        'light.quadratic': .032
      })
      cubePosition.map((position, i) => {
        let cubemMatrix = mat4.create()
        mat4.rotate(cubemMatrix, cubemMatrix, toRadian(20 * i), ligthPos)
        mat4.translate(cubemMatrix, cubemMatrix, position)
        this.pointPrg.style({
          mMatrix: cubemMatrix
        })
        this.cube.draw()
      })
    } else if (this.params.spotLight) {
      this.spotPrg.use()
      this.cube.bind(this.spotPrg)

      this.spotPrg.style({
        vMatrix,
        pMatrix,
        camPos: this.camera.cameraPos,
        'material.shininess': 30,
        'material.diffuse': 0,
        'material.specular': 1,
        'material.emission': 2,
        'light.ambient': [.1, .1, .1],
        'light.diffuse': [.5, .5, .5],
        'light.specular': [1., 1., 1.],
        'light.position': this.camera.cameraPos,
        'light.direction': [-this.camera.cameraPos[0], -this.camera.cameraPos[1], -this.camera.cameraPos[2]],
        'light.cutOff': toRadian(12.5)
      })
      cubePosition.map((position, i) => {
        let cubemMatrix = mat4.create()
        mat4.rotate(cubemMatrix, cubemMatrix, toRadian(20 * i), ligthPos)
        mat4.translate(cubemMatrix, cubemMatrix, position)
        this.spotPrg.style({
          mMatrix: cubemMatrix
        })
        this.cube.draw()
      })
    }


    let mMatrix = mat4.identity(mat4.create())
    mat4.scale(mMatrix, mMatrix, [.05, .05, .05]) //先缩放再位移，防止先位移缩放改变了位移值
    mat4.translate(mMatrix, mMatrix, ligthPos)
    this.lampPrg.use()
    this.lampPrg.style({
      mMatrix,
      vMatrix,
      pMatrix,
      lightColor
    })
    gl.bindVertexArray(this.lampVao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}
