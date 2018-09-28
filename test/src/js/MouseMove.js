import {
  quat
} from 'gl-matrix'

export default function MouseMove (e, canvas) {
  let cw = canvas.clientWidth
  let ch = canvas.clientHeight
  var wh = 1 / Math.sqrt(cw * cw + ch * ch)

  let x = e.clientX - canvas.offsetLeft - cw * 0.5
  let y = e.clientY - canvas.offsetTop - ch * 0.5

  let q = quat.create()
  var sq = Math.sqrt(x * x + y * y)
  var r = sq * 2.0 * Math.PI * wh // 距离来表示旋转弧度
  if (sq !== 1) {
    sq = 1 / sq
    x *= sq
    y *= sq
  }
  quat.setAxisAngle(q, [y, x, 0], r) // 旋转轴向量与(x,y,0)垂直

  return q
}
