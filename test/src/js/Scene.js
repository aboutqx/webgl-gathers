import {
  canvas
} from 'libs/GlTools'

import reflection from './Reflection'
import mask from './Mask'
import shadow from './Shadow'
import mrt from './Mrt'
import mirror from './Mirror'
import pbr from './Pbr'
import ibl from './ibl'
import iblfinal from './iblFinal'
import ssao from './SSAO'

import MouseMove from './MouseMove'

let objs = {
  reflection,
  mask,
  shadow,
  mrt,
  mirror,
  pbr,
  ibl,
  iblfinal,
  ssao
}

let name = location.hash.replace('#', '').toLocaleLowerCase()

let obj = new objs[name]()

canvas.addEventListener('mousemove', (e) => {
  obj.rotateQ = MouseMove(e, canvas)
})
export default function play () {
  obj.play()
}
