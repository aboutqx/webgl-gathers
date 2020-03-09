import Pipeline from '../PipeLine'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'
import vs from 'shaders/pbr/pbr.vert'
import fs from 'shaders/pbr/pbr.frag'
import mapVs from 'shaders/pbr/pbr_map.vert'
import mapFs from 'shaders/pbr/pbr_map.frag'
import {
  Sphere
} from '../Torus'
import {
  mat4,
  vec3
} from 'gl-matrix'
import Mesh from 'libs/Mesh'
import Texture from 'libs/glTexture'

const nrRows = 7
const nrColumns = 7
const spacing = .8

export default class Pbr extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    gl.getExtension('OES_standard_derivatives')
    this.prg = this.compile(vs, fs)
    this.mapPrg = this.compile(mapVs, mapFs)
  }
  attrib() {
    let {
      pos,
      index,
      normal,
      uv
    } = Sphere(256, 256, .25)


    let sphere = new Mesh()
    sphere.bufferVertex(pos)
    sphere.bufferIndex(index)
    sphere.bufferNormal(normal)
    sphere.bufferTexCoord(uv)
    this.sphere = sphere

  }
  prepare() {

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)


  }
  uniform() {

    let vMatrix = mat4.create()
    let pMatrix = mat4.create()

    this.tmpMatrix = mat4.create()

    let eyeDirection = []
    let camUpDirection = []

    if(this.params.map === 'none')
      vec3.transformQuat(eyeDirection, [0.0, 0.0, 5.0], this.rotateQ)
    else
      vec3.transformQuat(eyeDirection, [0.0, 0.0, 1.0], this.rotateQ)
    vec3.transformQuat(camUpDirection, [0.0, 1.0, 0.0], this.rotateQ)
    this.eyeDirection = eyeDirection

    mat4.lookAt(vMatrix, eyeDirection, [0, 0, 0], camUpDirection)
    mat4.perspective(pMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)
    mat4.multiply(this.tmpMatrix, pMatrix, vMatrix)


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

    this.texture0 = new Texture(gl, gl.RGBA).fromImage(getAssets[map + 'Albedo'])
    this.texture1 = new Texture(gl, gl.RGBA).fromImage(getAssets[map + 'Roughness'])
    this.texture2 = new Texture(gl, gl.RGBA).fromImage(getAssets[map + 'Metallic'])
    this.texture3 = new Texture(gl, gl.RGBA).fromImage(getAssets[map + 'Ao'])
    this.texture4 = new Texture(gl, gl.RGBA).fromImage(getAssets[map + 'Normal'])
  }

  render() {

    gl.clearColor(0.3, 0.3, 0.3, 1.);
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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
      lambertDiffuse: this.params.lambertDiffuse,
    }
    if (this.params.map === 'none') {
      this.prg.use()
      this.prg.style({
        ...baseUniforms,
        albedo: [.5, .0, .0],
        ao: 1.
      })
      this.sphere.bind(this.prg, ['position', 'normal'])
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
          this.sphere.draw()
        }
      }
    } else {
      this.mapPrg.use()

      this.texture0.bind(0)
      this.texture1.bind(1)
      this.texture2.bind(2)
      this.texture3.bind(3)
      this.texture4.bind(4)
      this.mapPrg.style({
        ...baseUniforms,
        mMatrix: mMatrix,
        albedoMap: 0,
        roughnessMap: 1,
        metallicMap: 2,
        aoMap: 3,
        normalMap: 4
      })
      this.sphere.bind(this.mapPrg)
      this.sphere.draw()
    }
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
