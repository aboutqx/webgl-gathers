import Program from 'libs/GLShader'
import CameraPers from 'libs/cameras/CameraPerspective'
import OrbitalControls from 'libs/controls/OrbitalControls'
import { gl, GlTools, canvas } from 'libs/GlTools'
import FrameBufferGUI from 'libs/helpers/FrameBufferGUI'
import * as dat from 'dat.gui'


export default class Pipeline {
  mousePos = { x:0, y:0 }
  camera = new CameraPers(45, canvas.width / canvas.height, .1, 1000)
  _params = {}
  gui = new dat.GUI({
    width: 300
  })

  constructor() {
    this.orbital = new OrbitalControls(this.camera)
    GlTools.setCamera(this.camera)
    this.init()
    this.attrib()
    this.prepare()
    this._setGUI()

    this._animate = this.animate.bind(this)
    this.frameBufferGUI = new FrameBufferGUI()
    
    GlTools.customGlState()
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

    this.orbital.updateMatrix()
    this.uniform()
    this.render()
    this.frameBufferGUI.draw()
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


