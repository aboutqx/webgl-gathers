import Program from 'libs/glProgram'


export default class Pipeline {
  gl
  prg
  posBuffer
  vs
  fs

  constructor(gl, vs, fs) {
    this.gl = gl
    this.init(vs, fs)
    this.attrib()
    this.prepare()

    this._animate = this.animate.bind(this)
  }
  init(vs, fs) {

    this.prg = new Program(this.gl)
    this.prg.compile(vs, fs)
    this.prg.use()
  }
  attrib() {

  }
  uniform() {

  }
  prepare() {

  }
  animate() {
    requestAnimationFrame(this._animate)

    let gl = this.gl
    gl.clearColor(0., 0.3, .3, 1.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.uniform()
    this.render()
  }
  render() {

  }
  play() {
    this.animate()
  }
}


