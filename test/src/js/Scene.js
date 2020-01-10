import {
  canvas
} from 'libs/GlTools'
import MouseMove from './MouseMove'

const importLists = {
  reflection: 'Light/Reflection',
  mask: 'OpenGL/Mask',
  shadow: 'AdvancedLight/Shadow',
  deferredshading: 'AdvancedLight/DeferredShading',
  mrt: 'OpenGL/Mrt',
  mirror: 'OpenGL/Mirror',
  pbr: 'Pbr/Pbr',
  ibldiffuse: 'Pbr/IblDiffuse',
  iblfinal: 'Pbr/iblFinal',
  ssao: 'AdvancedLight/SSAO',
  normalmap: 'AdvancedLight/NormalMap',
  pbrflow: 'Pbr/PbrFlow',
  lightcaster: 'Light/LightCaster',
  color: 'Light/Color',
  material: 'Light/Material',
  pbrmodel: 'Pbr/PbrModel',
  envMap: 'AdvancedLight/EnvironmentMap',
  gltf: 'Pbr/gltf'
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




