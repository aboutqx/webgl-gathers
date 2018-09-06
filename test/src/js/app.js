
import load from 'load-asset'

const assets = {
  koala: './Koala.jpg'
}
async function loadScene () {
  window.getAssets = await load.any(assets, ({
    progress,
    error
  }) => {
    // progressbar.innerHTML = 'Loading...' + (progress * 100).toFixed() + '%';
    if (error) console.error(error)
  })
  const play = require('./Scene').default
  play()
}
loadScene()
