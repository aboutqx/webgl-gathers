import { mat4 } from 'gl-matrix'
import { canvas } from 'libs/GlTools'
// cameraFront = -(cameraPos - camraTarget)
const getMouse = function (mEvent, mTarget, finger2) {

  const o = mTarget || {};
  if (mEvent.touches && !finger2) {
    o.x = mEvent.touches[0].pageX;
    o.y = mEvent.touches[0].pageY;
  } else if (!mEvent.touches) {
    o.x = mEvent.clientX;
    o.y = mEvent.clientY;

  } else if (mEvent.touches && finger2) {
    o.x = mEvent.touches[1].pageX;
    o.y = mEvent.touches[1].pageY;
  }

  return o;
}

export default class Camrea {
  cameraPos
  up
  cameraFront = [0, 0, -1]
  _mouse = {}
  _preMouse = {}
  _mousedown =false
  _rx = 0
  _ry = 0
  _preRx = 0
  _preRy = 0
  _targetRx = 0
  _targetRy = 0
  _radius = 5
  _tmp = mat4.identity(mat4.create())
  _width = canvas.width
  _height = canvas.height
  sensitivity = 1.
  _offset = [0, 0, 0]
  constructor (position = [0,0,0], up = [0, 1, 0]) {
    this.cameraPos = position
    this.up = up

    this._addEvents()
  }

  _addEvents () {
    canvas.addEventListener('mousedown', (e) => this._down(e))
    canvas.addEventListener('mousemove', e => this._move(e))
    document.addEventListener('mouseup', e => this._up(e))

  }

  _down(mEvent) {
    this._mousedown = true
    getMouse(mEvent, this._mouse)
    getMouse(mEvent, this._preMouse)
    // reset 重新开始计算
    this._preRx = this._targetRx
    this._preRy = this._targetRy
  }

  _move(mEvent) {
    if(this._mousedown) {
      getMouse(mEvent, this._mouse)
      let diffX = (this._mouse.x - this._preMouse.x) / this._width
      let diffY = (this._mouse.y - this._preMouse.y) / this._height

      this._targetRx = this._preRx + diffX * Math.PI * 2 * this.sensitivity
      this._targetRy = this._preRy + diffY * Math.PI * this.sensitivity

    }

  }

  _up(mEvent) {
    this._mousedown = false
  }

  updateMatrix (){
    const MIN_DIFF = 0.0001;
    this._rx += (this._targetRx - this._rx) * 0.1 //ease out
    if (Math.abs(this._targetRx - this._rx) < MIN_DIFF) {
      this._rx = this._targetRx
    }

    this._ry += (this._targetRy - this._ry) * 0.1 //ease out
    if (Math.abs(this._targetRy - this._ry) < MIN_DIFF) {
      this._ry = this._targetRy
    }


    this.cameraPos[1] = Math.sin(this._ry) * this._radius
    let tr = Math.abs(Math.cos(this._ry) * this._radius) // 防止y突然从1变成-1，x，z的象限变化
    this.cameraPos[0] = Math.cos(this._rx + Math.PI * 0.5) * tr
    this.cameraPos[2] = Math.sin(this._rx + Math.PI * 0.5) * tr

    //mat4.lookAt(mat4.create(), this.cameraPos, this.cameraPos + this.cameraFront, this.up)
    this.cameraPos = [this.cameraPos[0] + this._offset[0], this.cameraPos[1] + this._offset[1], this.cameraPos[2] + this._offset[2]]
    mat4.lookAt(this._tmp, this.cameraPos, [0, 0, 0], this.up)
  }

  set offset(arr) {
    this._offset = arr
  }


  get viewMatrix() {

    return this._tmp
  }

  set radius(value) {
    this._radius = value
  }
}
