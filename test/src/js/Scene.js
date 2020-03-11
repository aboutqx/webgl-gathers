import {
  canvas
} from 'libs/GlTools'
import MouseMove from './MouseMove'

const importLists = {
  reflection: 'Light/Reflection',
  lightcaster: 'Light/LightCaster',
  instance: 'OpenGL/Instance',
  material: 'Light/Material',
  shadow: 'Light/Shadow',
  deferredshading: 'OpenGL/DeferredShading',
  mask: 'OpenGL/Mask',
  mrt: 'OpenGL/Mrt',
  ssao: 'OpenGL/SSAO',
  normalMapping: 'Texturing/NormalMapping',
  heightMapping: 'Texturing/HeightMapping',
  reliefMapping: 'Texturing/ReliefMapping', // can alse provide self-shadowing.
  envMapping: 'Texturing/EnvironmentMapping',
  billboard: 'ImageBasedEffects/Billboard',
  bloom: 'ImageBasedEffects/Bloom',
  pbr: 'Pbr/Pbr',
  ibldiffuse: 'Pbr/IblDiffuse',
  iblfinal: 'Pbr/iblFinal',
  pbrflow: 'Pbr/PbrFlow',
  pbrmodel: 'Pbr/PbrModel',
  gltf: 'Model/Gltf',
  water: 'NaturalEffects/Water',
  grass: 'NaturalEffects/Grass'
}

function addList(){
  let list = document.querySelector('.list')
  for (let key in importLists) {
    let link = document.createElement('a')
    link.innerHTML = key
    link.setAttribute('href','?'+key)
    list.appendChild(link)
    let br = document.createElement('br')
    list.appendChild(br)
  }
}

let obj
const dynamicImport = (name) => {
  import(`./${importLists[name]}`).then((foo) => {

    obj = new foo.default()

    canvas.addEventListener('mousemove', (e) => {
      let t = MouseMove(e, canvas)
      obj.rotateQ = t.q
      obj.mousePos = t.mousePos
    })
    obj.play()
  })
}

let name = location.search.replace('?', '')
if(name) dynamicImport(name)
else addList()




