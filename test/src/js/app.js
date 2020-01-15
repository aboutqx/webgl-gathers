import load from 'load-asset'
import mapAssets from './Assets'
import AssetsInit from './AssetsInit'

let assets = {
  wood: './assets/wood.png',
  splash: './assets/flower.png'
}
let name = location.search.replace('?', '')

for (let key in mapAssets) {
  if(name === key) assets = mapAssets[key]
}
async function loadScene () {
  let files = await load.any(assets, ({
    progress,
    error
  }) => {
    // progressbar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
    if (error) console.error(error)
  })
  window.getAssets = AssetsInit(assets, files)
  import('./Scene')

}
loadScene()
