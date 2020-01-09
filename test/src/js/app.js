import load from 'load-asset'
import mapAssets from './Assets'

let assets = {
  wood: './assets/wood.png',
  splash: './assets/flower.png'
}
let name = location.search.replace('?', '')

for (let key in mapAssets) {
  if(name === key) assets = mapAssets[key]
}
async function loadScene () {
  window.getAssets = await load.any(assets, ({
    progress,
    error
  }) => {
    // progressbar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
    if (error) console.error(error)
  })
  import('./Scene')

}
loadScene()
