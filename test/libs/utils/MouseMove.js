import {
    quat
} from 'gl-matrix'
import { canvas } from '../GlTools'

class MouseMove {
    cw = canvas.width
    ch = canvas.height
    mousePos = {}

    constructor() {

    }
    caculateRotate() {
        let wh = 1 / Math.sqrt(cw * cw + ch * ch)
        getPos(e, mousePos)
    
        let x = mousePos.x - canvas.offsetLeft - cw * 0.5
        let y = mousePos.y - canvas.offsetTop - ch * 0.5
    
        const q = quat.create()
        let sq = Math.sqrt(x * x + y * y)
        let r = sq * 2.0 * Math.PI * wh // 距离来表示旋转弧度
        if (sq !== 1) {
            sq = 1 / sq
            x *= sq
            y *= sq
        }
        quat.setAxisAngle(q, [y, x, 0], r) // 旋转轴向量与(x,y,0)垂直
    
        const mousePercent = { x: mousePos.x / cw, y: mousePos.y / ch}
        return { q, mousePos, mousePercent }
    }

    addEvents(down, move, up, wheel) {
        canvas.addEventListener('mousedown', down)
        canvas.addEventListener('mousemove', move)
        document.addEventListener('mouseup', up)

        canvas.addEventListener('mousewheel', wheel);
        canvas.addEventListener('DOMMouseScroll', wheel);
    }

    removeEvents(down, move, up, wheel) {
        canvas.removeEventListener('mousedown', down)
        canvas.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)

        canvas.removeEventListener('mousewheel', wheel);
        canvas.removeEventListener('DOMMouseScroll', wheel);
    }

    _patchEvent(mEvent, func) {
        func()
    }

    getPos(mEvent, mTarget, finger2) {

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

    get mousePos() {
        return this.mousePos
    }
}

const m = new MouseMove()
export default m