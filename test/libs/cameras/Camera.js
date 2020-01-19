import { mat4 } from 'gl-matrix'
import { canvas, toRadian } from 'libs/GlTools'
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
const MIN_DIFF = 0.0001;

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
  _viewMatrix = mat4.identity(mat4.create())
  _width = canvas.width
  _height = canvas.height
  sensitivity = 1.
  target = [0, 0, 0]
  offset = [0, 0, 0]
  radius = 5
  _targetRadius = 5
  _updateWheel = false
  constructor (position = [0,0,0], up = [0, 1, 0]) {
    this.cameraPos = position
    this.up = up
    this.projMatrix = mat4.create()
    mat4.perspective(this.projMatrix, toRadian(45), canvas.clientWidth / canvas.clientHeight, .1, 100)
    this._addEvents()
  }

  setProj(fov, near, far){
    mat4.perspective(this.projMatrix, toRadian(fov), canvas.clientWidth / canvas.clientHeight, near, far)
  }

  _addEvents () {
    canvas.addEventListener('mousedown', (e) => this._down(e))
    canvas.addEventListener('mousemove', e => this._move(e))
    document.addEventListener('mouseup', e => this._up(e))

    canvas.addEventListener('mousewheel', (e) => this._onWheel(e));
    canvas.addEventListener('DOMMouseScroll', (e) => this._onWheel(e));
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
    this._rx += (this._targetRx - this._rx) * 0.1 //ease out
    if (Math.abs(this._targetRx - this._rx) < MIN_DIFF) {
      this._rx = this._targetRx
    }

    this._ry += (this._targetRy - this._ry) * 0.1 //ease out
    if (Math.abs(this._targetRy - this._ry) < MIN_DIFF) {
      this._ry = this._targetRy
    }
    // or use scheduling to add EF
    if(this._updateWheel) {
      this.radius += (this._targetRadius - this.radius) * 0.1 //ease out
      if (Math.abs(this._targetRadius - this.radius) < MIN_DIFF) {
        this.radius = this._targetRadius
      }
    }

    this.cameraPos[1] = Math.sin(this._ry) * this.radius
    let tr = Math.abs(Math.cos(this._ry) * this.radius) // 防止y突然从1变成-1，x，z的象限变化
    this.cameraPos[0] = Math.cos(this._rx + Math.PI * 0.5) * tr
    this.cameraPos[2] = Math.sin(this._rx + Math.PI * 0.5) * tr

    //mat4.lookAt(mat4.create(), this.cameraPos, this.cameraPos + this.cameraFront, this.up)
    this.cameraPos = [this.cameraPos[0] + this.offset[0], this.cameraPos[1] + this.offset[1], this.cameraPos[2] + this.offset[2]]
    mat4.lookAt(this._viewMatrix, this.cameraPos, this.target, this.up)
  }

  _onWheel(mEvent) {
    const w = mEvent.wheelDelta;
    const d = mEvent.detail;
    let value = 0;
    if (d) {
      if (w) {
        value = w / d / 40 * d > 0 ? 1 : -1; // Opera
      } else {
        value = -d / 3; // Firefox;         TODO: do not /3 for OS X
      }
    } else {
      value = w / 120;
    }

    this._targetRadius = this.radius + (-value * 1)
    if(this._targetRadius <= 1) this._targetRadius = 1
    this._updateWheel = true
  }

  get viewMatrix() {
    return this._viewMatrix
  }

  // 设置旋转角度
  set rx(value) {
    this._targetRx = value
  }
}
