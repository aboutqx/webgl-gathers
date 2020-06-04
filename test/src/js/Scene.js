import {
    canvas
} from 'libs/GlTools'
import MouseMove from './MouseMove'

const importLists = {
    Light: [
        'Reflection',
        'LightCaster',
        'Material',
        'Shadow',
    ],
    Shading:[
        'Instance',
        'Gpgpu',
        'DeferredShading',
        'Mask',
        'SSAO',
        'Noise'
    ],
    Texturing: [
        'NormalMapping',
        'HeightMapping',
        'ReliefMapping', // can also provide self-shadowing.
        'EnvironmentMapping',
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
        'Water',
        'Grass'
    ]
}

function addList() {
    let list = document.querySelector('.list')
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
    let scene = await import(`./${dir}/${module}`) 

    let obj = new scene.default()

    canvas.addEventListener('mousemove', (e) => {
        let t = MouseMove(e, canvas)
        obj.mousePos = t.mousePos
    })
    obj.play()

}

let name = location.search.replace('?', '')
if (name) dynamicImport(name.split('/'))
else addList()
