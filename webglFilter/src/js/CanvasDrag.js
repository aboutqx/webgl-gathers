export default class CanvasDrag {
  _canvas = null
  _start = false

  constructor(canvas){
    this._canvas = canvas
    this._down = this._down.bind(this)
    this._move = this._move.bind(this)
    this._up = this._up.bind(this)
    this._setupEvent()
  }
  _setupEvent() {
    this._canvas.addEventListener('mousedown',this._down)
    this._canvas.addEventListener('mousemove', this._move)
    this._canvas.addEventListener('mouseup', this._up)
  }
  _down() {
    this._start = true
  }
  _move() {
    if (this._start) {

    }
  }
  _up() {
    this._start = true
  }

  static getMouse() {

  }
}
