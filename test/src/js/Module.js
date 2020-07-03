const importLists = {
    Light: [
        'Reflection',
        'LightCaster',
        'Material',
        'Shadow',
    ],
    Shading:[
        'Instance',
        'DeferredShading',
        'Mask',
        'SSAO',
        'Noise'
    ],
    Texturing: [
        'NormalMapping',
        'HeightMapping',
        'ReliefMapping', // can also provide self-shadowing.
        'EnvMapping',
    ],
    ImageSpaceEffects: [
        'Billboard',
        'Bloom',
        'Fog'
    ],
    Pbr: [
        'Pbr',
        'IblDiffuse',
        'iblFinal',
    ],
    Optimization: [
        'Gltf',
        'FrustumCulling',
        'OcclusionCulling',
        'LOD'
    ],
    NaturalEffects: [
        'Mountain',
        'Water',
        'Grass',
        'Particle',
        'Petal'
    ]
}

function addList() {
    const list = document.querySelector('.list')
    for (let dir in importLists) {
        list.innerHTML+= `
            <div>${dir}</div>
        `
        importLists[dir].forEach(name =>
            list.innerHTML+= `
                
                <div><a href="?${dir}/${name}">${name}</a></div>

            `
        )
    }
}


async function dynamicImport(nameSplit) {
    const dir = nameSplit[0]
    const module = nameSplit[1]
    const scene = await import(`./${dir}/${module}`) 

    const obj = new scene.default()

    obj.play()

}

const name = location.search.replace('?', '')
if (name) dynamicImport(name.split('/'))
else addList()
