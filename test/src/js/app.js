import load from 'load-asset'
import Assets from './Assets'

let assets = {
  wood: './assets/wood.png',
  splash: './assets/flower.png'
}
let name = location.search.replace('?', '').toLocaleLowerCase()

if ( name === 'ibldiffuse' || name === 'iblfinal') {
  Object.assign(assets, Assets.hdrSkybox)

}
const mapAssets = {
  lightcaster: { ...Assets.materialMaps },
  normalmap: { ...Assets.brickwall },
  pbr: { ...Assets.ballMaps },
  pbrflow: { ...Assets.hdrSkybox, ...Assets.iblMaps, ...Assets.ballMaps },
  pbrmodel: { ...Assets.hdrSkybox, ...Assets.iblMaps,...Assets.orb },
  deferredshading: { ...Assets.nanosuit },
  ssao: { ...Assets.nanosuit }
}
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
