import Program from 'libs/GLShader'
import Camera from 'libs/cameras/Camera'
import { quat, mat4 } from 'gl-matrix';
import { gl, GlTools } from 'libs/GlTools'
import * as dat from 'dat.gui'


export default class Pipeline {
  rotateQ = quat.create()
  mousePos = { x:0, y:0 }
  camera = new Camera()
  pMatrix = mat4.identity(mat4.create())
  mvpMatrix = mat4.identity(mat4.create())
  tmpMatrix = mat4.identity(mat4.create())

  _params = {}
  gui = new dat.GUI({
    width: 300
  })
  constructor() {
    this.vMatrix = this.camera.viewMatrix
    GlTools.setCamera(this.camera)
    this.init()
    this.attrib()
    this.prepare()
    this._setGUI()

    this._animate = this.animate.bind(this)
    
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.CULL_FACE)

  }
  init() {
    
  }
  compile(vs, fs) {
    let prg = new Program(vs,fs)

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


