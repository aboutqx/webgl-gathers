import {
  canvas
} from 'libs/GlTools'
import MouseMove from './MouseMove'

const importLists = {
  reflection: 'Light/Reflection',
  mask: 'OpenGL/Mask',
  shadow: 'advanced_light/Shadow',
  deferredshading: 'advanced_light/DeferredShading',
  mrt: 'OpenGL/Mrt',
  mirror: 'OpenGL/Mirror',
  pbr: 'Pbr/Pbr',
  ibldiffuse: 'Pbr/IblDiffuse',
  iblfinal: 'Pbr/iblFinal',
  ssao: 'advanced_light/SSAO',
  normalmap: 'advanced_light/NormalMap',
  pbrflow: 'Pbr/PbrFlow',
  lightcaster: 'Light/LightCaster',
  color: 'Light/Color',
  material: 'Light/Material',
  pbrmodel: 'Pbr/PbrModel',
  shape: 'Shape'
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
      obj.rotateQ = MouseMove(e, canvas)
    })
    obj.play()
  })
}

let name = location.search.replace('?', '').toLocaleLowerCase()
if(name) dynamicImport(name)
else addList()




