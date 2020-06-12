import { canvas, toRadian } from 'libs/GlTools'
import { vec3 } from 'gl-matrix'
import EaseNumber from '../utils/EaseNumber';

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

export default class OrbitalControls {
    up = [0, 1, 0]
    cameraFront = [0, 0, -1]
    _mouse = {}
    _preMouse = {}
    _mousedown = false
    _rx = new EaseNumber(0)
    _ry = new EaseNumber(0)
    _preRx = 0
    _preRy = 0
    sensitivity = 1
    position = [0, 0, 0]
    target = [0, 0, 0]
    offset = [0, 0, 0]
    _radius = new EaseNumber(5)
    _targetRadius = 5
    _updateWheel = false
    constructor(cameraPers) {
        this.cameraPers = cameraPers
        this._ry.limit(-Math.PI / 2, Math.PI / 2);

        this._addEvents()
        
    }


    _addEvents() {
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
        this._preRx = this._rx.targetValue;
        this._preRy = this._ry.targetValue;
    }

    _move(mEvent) {
        if (this._mousedown) {
            getMouse(mEvent, this._mouse)
            let diffX = (this._mouse.x - this._preMouse.x) / canvas.width
            let diffY = (this._mouse.y - this._preMouse.y) / canvas.height

            this._rx.value = this._preRx + diffX * Math.PI  * 2 * this.sensitivity
            this._ry.value = this._preRy + diffY * Math.PI * this.sensitivity

        }

    }

    _up(mEvent) {
        this._mousedown = false
    }

    flipY() {

        this.position[1] = -this.position[1]
        this.up[1] = - this.up[1]

        this.cameraPers.lookAt(this.position, this.target, this.up)
    }

    updateMatrix() {

        // or use scheduling to add EF
        if (this._updateWheel) {
            this._radius.value = this._targetRadius
        }

        this.position[1] = Math.sin(this._ry.value) * this._radius.value

        const tr = Math.cos(this._ry.value) * this._radius.value // 防止y突然从1变成-
        this.position[0] = Math.cos(this._rx.value) * tr
        this.position[2] = Math.sin(this._rx.value) * tr

        vec3.add(this.position, this.position, this.offset)

        this.cameraPers.lookAt(this.position, this.target, this.up)

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

        this._targetRadius = this._radius.value + (-value * 1)
        if (this._targetRadius <= 1) this._targetRadius = 1
        this._updateWheel = true
    }

    get viewMatrix() {
        return this._viewMatrix
    }

    get rx() {
        return this._rx
    }

    get ry() {
        return this._ry
    }

    set radius(value) {
        this._radius.value = value
    }
}
