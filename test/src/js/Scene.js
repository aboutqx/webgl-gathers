import reflection from './Reflection'
import mask from './Mask'
import shadow from './Shadow'
import mrt from './Mrt'
import mirror from './Mirror'

let objs = {
  reflection,
  mask,
  shadow,
  mrt,
  mirror
}
let canvas = document.querySelector('canvas')
let name = location.hash.replace('#', '')

let gl = canvas.getContext('webgl', {
  antialias: true,
  stencil: true
})

let obj = new objs[name](gl)

export default function play () {
  obj.play()
}
