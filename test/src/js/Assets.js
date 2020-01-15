const Assets = {
  materialMaps: {
    cubeDiffuse: './assets/cubeDiffuse.png',
    cubeSpecular: './assets/cubeSpecular.png',
    cubeEmission: './assets/cubeEmission.jpg'
  },
  ballMaps: {
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
  },
  hdrSkybox: {
    // equirectangular: { url: './assets/hdr/pisa_latlong_256.hdr', type: 'binary' }
    equirectangular: { url: './assets/hdr/newport_loft.hdr', type: 'binary' }
  },
  iblMaps: {
    irradiancePosX: { url: './assets/pbrflow/output_iem_posx.hdr', type: 'binary' },
    irradiancePosY: { url: './assets/pbrflow/output_iem_posy.hdr', type: 'binary' },
    irradiancePosZ: { url: './assets/pbrflow/output_iem_posz.hdr', type: 'binary' },
    irradianceNegX: { url: './assets/pbrflow/output_iem_negx.hdr', type: 'binary' },
    irradianceNegY: { url: './assets/pbrflow/output_iem_negy.hdr', type: 'binary' },
    irradianceNegZ: { url: './assets/pbrflow/output_iem_negz.hdr', type: 'binary' },
    radiance: { url: './assets/pbrflow/output_radiance.dds', type: 'binary' },
  },
  orb: {
    orb: { url: './assets/models/lte_orb/testObj.obj', type: 'text' }
  },
  nanosuit: {
    nanosuit: { url: './assets/models/nanosuit/nanosuit.obj', type: 'text' },
    nanosuitMTL: { url: './assets/models/nanosuit/nanosuit.mtl', type: 'text' }
  },
  brickwall: {
    brickwall: { url: './assets/brickwall.jpg' },
    brickwallNormal: { url: './assets/brickwall_normal.jpg' }
  },
  skybox:{
    outputskyboxPosX: { url: './assets/skybox/output_skybox_posx.hdr', type: 'binary' },
    outputskyboxPosY: { url: './assets/skybox/output_skybox_posy.hdr', type: 'binary' },
    outputskyboxPosZ: { url: './assets/skybox/output_skybox_posz.hdr', type: 'binary' },
    outputskyboxNegX: { url: './assets/skybox/output_skybox_negx.hdr', type: 'binary' },
    outputskyboxNegY: { url: './assets/skybox/output_skybox_negy.hdr', type: 'binary' },
    outputskyboxNegZ: { url: './assets/skybox/output_skybox_negz.hdr', type: 'binary' },
  },
  venus: {
    venus: { url:'./assets/models/venus.obj', type: 'text'}
  },
  statue: {
    statue: { url:'./assets/models/statue.obj', type: 'text'}
  },
  gltf:{
    albedo:{"url":"assets/img/albedo.jpg","type":"image"},
    ao:{"url":"assets/img/ao.jpg","type":"image"},
    brdfLUT:{"url":"assets/img/brdfLUT.png","type":"image"},
    metalGloss:{"url":"assets/img/metalGloss.jpg","type":"image"},
    normal:{"url":"assets/img/normal.jpg","type":"image"},
    pisa_irradiance:{"url":"assets/img/pisa_irradiance.dds","type":"binary"},
    pisa_radiance:{"url":"assets/img/pisa_radiance.dds","type":"binary"},
    studio10_irradiance:{"url":"assets/img/studio10_irradiance.dds","type":"binary"},
    studio10_radiance:{"url":"assets/img/studio10_radiance.dds","type":"binary"},
    studio11_irradiance:{"url":"assets/img/studio11_irradiance.dds","type":"binary"},
    studio11_radiance:{"url":"assets/img/studio11_radiance.dds","type":"binary"},
    studio12_irradiance:{"url":"assets/img/studio12_irradiance.dds","type":"binary"},
    studio12_radiance:{"url":"assets/img/studio12_radiance.dds","type":"binary"},
    studio1_irradiance:{"url":"assets/img/studio1_irradiance.dds","type":"binary"},
    studio1_radiance:{"url":"assets/img/studio1_radiance.dds","type":"binary"},
    studio2_irradiance:{"url":"assets/img/studio2_irradiance.dds","type":"binary"},
    studio2_radiance:{"url":"assets/img/studio2_radiance.dds","type":"binary"},
    studio3_irradiance:{"url":"assets/img/studio3_irradiance.dds","type":"binary"},
    studio3_radiance:{"url":"assets/img/studio3_radiance.dds","type":"binary"},
    studio4_irradiance:{"url":"assets/img/studio4_irradiance.dds","type":"binary"},
    studio4_radiance:{"url":"assets/img/studio4_radiance.dds","type":"binary"},
    studio5_irradiance:{"url":"assets/img/studio5_irradiance.dds","type":"binary"},
    studio5_radiance:{"url":"assets/img/studio5_radiance.dds","type":"binary"},
    studio6_irradiance:{"url":"assets/img/studio6_irradiance.dds","type":"binary"},
    studio6_radiance:{"url":"assets/img/studio6_radiance.dds","type":"binary"},
    studio7_irradiance:{"url":"assets/img/studio7_irradiance.dds","type":"binary"},
    studio7_radiance:{"url":"assets/img/studio7_radiance.dds","type":"binary"},
    studio8_irradiance:{"url":"assets/img/studio8_irradiance.dds","type":"binary"},
    studio8_radiance:{"url":"assets/img/studio8_radiance.dds","type":"binary"},
    studio9_irradiance:{"url":"assets/img/studio9_irradiance.dds","type":"binary"},
    studio9_radiance:{"url":"assets/img/studio9_radiance.dds","type":"binary"},
    vatican_irradiance:{"url":"assets/img/vatican_irradiance.dds","type":"binary"},
    vatican_radiance:{"url":"assets/img/vatican_radiance.dds","type":"binary"}
  }


}
const mapAssets = {
  reflection: { ...Assets.statue, ...Assets.venus },
  lightcaster: { ...Assets.materialMaps },
  normalmap: { ...Assets.brickwall },
  pbr: { ...Assets.ballMaps },
  pbrflow: { ...Assets.hdrSkybox, ...Assets.iblMaps, ...Assets.ballMaps },
  pbrmodel: { ...Assets.hdrSkybox, ...Assets.iblMaps,...Assets.orb },
  ibldiffuse: { ...Assets.hdrSkybox },
  iblfinal: { ...Assets.hdrSkybox },
  deferredshading: { ...Assets.nanosuit },
  ssao: { ...Assets.nanosuit },
  envMap: { ...Assets.skybox, ...Assets.venus, ...Assets.nanosuit, ...Assets.statue },
  gltf: { ...Assets.skybox, ...Assets.gltf },
  bloom: { ...Assets.statue }
}
export default mapAssets
