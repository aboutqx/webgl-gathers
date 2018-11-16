const canvas = document.querySelector('canvas')
const options = {
  antialias: false,
  stencil: true
}
const name = location.search.replace('?', '').toLocaleLowerCase()
let gl
if (name !== 'mrt' && name !== 'mirror' && name !== 'pbr' && name !== 'ibl' ) {
  gl = canvas.getContext('webgl2', options)
  if (!gl) console.warn('webgl2 not supported!')
  console.log('webgl2 used.')
  window.useWebgl2 = true
} else gl = canvas.getContext('webgl', options)

const toRadian = (deg) => {
  return deg / 180 * Math.PI
}

const canvasWidth = canvas.width
const canvasHeight = canvas.height

export { gl, canvas, toRadian, canvasWidth, canvasHeight }
