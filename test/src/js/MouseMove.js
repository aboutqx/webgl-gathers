import {
  quat
} from 'gl-matrix'

const getMouse = function (mEvent, mTarget) {

	const o = mTarget || {};
	if(mEvent.touches) {
		o.x = mEvent.touches[0].pageX;
		o.y = mEvent.touches[0].pageY;
	} else {
		o.x = mEvent.clientX;
		o.y = mEvent.clientY;
	}

	return o;
}
let mousePos = {}

export default function MouseMove (e, canvas) {
  let cw = canvas.clientWidth
  let ch = canvas.clientHeight
  var wh = 1 / Math.sqrt(cw * cw + ch * ch)
  getMouse(e, mousePos)

  let x = mousePos.x- canvas.offsetLeft - cw * 0.5
  let y = mousePos.y - canvas.offsetTop - ch * 0.5

  let q = quat.create()
  var sq = Math.sqrt(x * x + y * y)
  var r = sq * 2.0 * Math.PI * wh // 距离来表示旋转弧度
  if (sq !== 1) {
    sq = 1 / sq
    x *= sq
    y *= sq
  }
  quat.setAxisAngle(q, [y, x, 0], r) // 旋转轴向量与(x,y,0)垂直

  return { q, mousePos }
}
