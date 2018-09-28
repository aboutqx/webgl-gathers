import reflection from './Reflection'
import mask from './Mask'
import shadow from './Shadow'
import mrt from './Mrt'
import mirror from './Mirror'

import MouseMove from './MouseMove'

let objs = {
  reflection,
  mask,
  shadow,
  mrt,
  mirror
}
let canvas = document.querySelector('canvas')
let name = location.hash.replace('#', '').toLocaleLowerCase()

let gl = canvas.getContext('webgl', {
  antialias: true,
  stencil: true
})

let obj = new objs[name](gl)

canvas.addEventListener('mousemove', (e) => {
  obj.rotateQ = MouseMove(e, canvas)
})
export default function play () {
  obj.play()
}
