let canvas = document.querySelector('canvas')
let gl = canvas.getContext('webgl', {
  antialias: true,
  stencil: true
})
const toRadian = (deg) => {
  return deg / 180 * Math.PI
}
export { gl, canvas, toRadian }
