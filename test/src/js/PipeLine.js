import Program from 'libs/glProgram'
import Camera from 'libs/Camera'
import { quat } from 'gl-matrix';
import { gl } from 'libs/GlTools'
import * as dat from 'dat.gui'


export default class Pipeline {
  rotateQ = quat.create()
  camera = new Camera()
  _params = {}
  gui = new dat.GUI({
    width: 300
  })
  constructor() {

    this.init()
    this.attrib()
    this.prepare()
    this._setGUI()

    this._animate = this.animate.bind(this)
  }
  init() {

  }
  compile(vs, fs) {
    let prg = new Program(gl)
    prg.compile(vs, fs)
    return prg
  }
  attrib() {

  }
  uniform() {

  }
  prepare() {

  }
  animate() {
    requestAnimationFrame(this._animate)

    this.camera.updateMatrix()
    this.uniform()
    this.render()
  }
  render() {

  }
  play() {
    this.animate()
  }

  _setGUI() {
    // this.addGUIParams({
    //   lt: 0.2,
    //   gt: 0.98,
    //   clamp: false
    // })
    // let folder = gui.addFolder('grayFocus')
    // folder.add(this.params, 'lt', 0, 1).step(0.01)
    // folder.add(this.params, 'gt', 0, 1).step(0.01)
    // folder.add(this.params, 'clamp')
    // folder.open()
  }

  addGUIParams(o) {
    return Object.assign(this._params, o)
  }
  get params() {
    return this._params
  }
  set params(param) {
    throw Error("Params has no setter,please use addGUIParams")
  }
}


