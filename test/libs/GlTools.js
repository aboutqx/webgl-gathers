let canvas = document.querySelector('canvas')
const options = {
  antialias: true,
  stencil: true
}
let name = location.hash.replace('#', '').toLocaleLowerCase()
let gl
if (name === 'iblfinal' || name === 'mask') {
  gl = canvas.getContext('webgl2', options)
  if (!gl) console.warn('webgl2 not supported!')
  console.log('webgl2 used.')
} else gl = canvas.getContext('webgl', options)

const toRadian = (deg) => {
  return deg / 180 * Math.PI
}
export { gl, canvas, toRadian }
