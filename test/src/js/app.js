import load from 'load-asset'
import mapAssets from './Assets'
import AssetsInit from './AssetsInit'
import ConsoleLog from 'utils/ConsoleLog'
import { canvas } from  'libs/GlTools'

const assets = {
  wood: './assets/wood.jpg',
  flower: './assets/flower.png'
}
const name = location.search.replace('?', '')

for (let key in mapAssets) {
  if (name.split('/')[1] === key) Object.assign(assets, mapAssets[key])
}
const progressDiv = document.querySelector('.progress')
const progressBar = document.querySelector('.progressBar')

async function loadScene() {
  let files = await load.any(assets, ({
    progress,
    error
  }) => {
    if(!name) return
    progressDiv.style.opacity = 1
    progressBar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
    if(progress == 1) {
      setTimeout(() => {
        progressDiv.style.opacity = 0
        canvas.style.opacity = 1
      }, 1000)
      

    }
    if (error) console.error(error)
  })
  window.getAssets = await AssetsInit(assets, files)
  import('./Module')

}
loadScene()
