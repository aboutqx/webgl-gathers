import reflection from './Reflection'
import mask from './Mask'

let objs = {
  reflection,
  mask
}
let canvas = document.querySelector('canvas')
let gl = canvas.getContext('webgl', {
  antialias: true
})

let name = location.hash.replace('#', '')
let obj = new objs[name](gl)
obj.play()
