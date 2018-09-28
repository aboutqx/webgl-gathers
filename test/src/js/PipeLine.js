import Program from 'libs/glProgram'
import { quat } from 'gl-matrix';


export default class Pipeline {
  gl
  prg
  posBuffer
  vs
  fs
  rotateQ = quat.create()
  constructor(gl) {
    this.gl = gl
    this.init()
    this.attrib()
    this.prepare()

    this._animate = this.animate.bind(this)
  }
  init() {

  }
  compile(vs, fs) {
    let prg = new Program(this.gl)
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

    this.uniform()
    this.render()
  }
  render() {

  }
  play() {
    this.animate()
  }
}


