import load from 'load-asset'

let assets = {
  koala: './assets/Koala.jpg',
  splash: './assets/splash.jpg'
}
let name = location.hash.replace('#', '').toLocaleLowerCase()
if (name === 'pbr' || name === 'ibl' || name === 'iblfinal') {
  let pbrLists = {
    goldAlbedo: './assets/pbr/gold/albedo.png',
    goldMetallic: './assets/pbr/gold/metallic.png',
    goldAo: './assets/pbr/gold/ao.png',
    goldNormal: './assets/pbr/gold/normal.png',
    goldRoughness: './assets/pbr/gold/roughness.png',

    grassAlbedo: './assets/pbr/grass/albedo.png',
    grassMetallic: './assets/pbr/grass/metallic.png',
    grassAo: './assets/pbr/grass/ao.png',
    grassNormal: './assets/pbr/grass/normal.png',
    grassRoughness: './assets/pbr/grass/roughness.png',

    plasticAlbedo: './assets/pbr/plastic/albedo.png',
    plasticMetallic: './assets/pbr/plastic/metallic.png',
    plasticAo: './assets/pbr/plastic/ao.png',
    plasticNormal: './assets/pbr/plastic/normal.png',
    plasticRoughness: './assets/pbr/plastic/roughness.png',

    wallAlbedo: './assets/pbr/wall/albedo.png',
    wallMetallic: './assets/pbr/wall/metallic.png',
    wallAo: './assets/pbr/wall/ao.png',
    wallNormal: './assets/pbr/wall/normal.png',
    wallRoughness: './assets/pbr/wall/roughness.png',

    rusted_ironAlbedo: './assets/pbr/rusted_iron/albedo.png',
    rusted_ironMetallic: './assets/pbr/rusted_iron/metallic.png',
    rusted_ironAo: './assets/pbr/rusted_iron/ao.png',
    rusted_ironNormal: './assets/pbr/rusted_iron/normal.png',
    rusted_ironRoughness: './assets/pbr/rusted_iron/roughness.png',

    woodAlbedo: './assets/pbr/wood/albedo.png',
    woodMetallic: './assets/pbr/wood/metallic.png',
    woodAo: './assets/pbr/wood/ao.png',
    woodNormal: './assets/pbr/wood/normal.png',
    woodRoughness: './assets/pbr/wood/roughness.png'
  }

  if (name === 'ibl' || name === 'iblfinal') {
    let iblList = {
      // equirectangular: { url: './assets/hdr/newport_loft.hdr', type: 'binary' }
      equirectangular: { url: './assets/hdr/newport_loft.hdr', type: 'binary' }
    }
    Object.assign(pbrLists, iblList)
  }
  Object.assign(assets, pbrLists)
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
