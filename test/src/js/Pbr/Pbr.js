import Pipeline from '../PipeLine'
import {
    GlTools
} from 'libs/GlTools'
import vs from 'libs/glsl/basic.vert'
import fs from 'shaders/pbr/pbr.frag'
import mapFs from 'shaders/pbr/pbr_map.frag'

import {
    mat4,
} from 'gl-matrix'
import Geom from 'libs/Geom'

const lightPositions = [ // use flatten array for gl.uniform3fv
    [-10., 10., 10.],
    [10., 10., 10.],
    [-10., -10., 10.],
    [10., -10., 10.],
]
const lightColors = [ // use flatten array for gl.uniform3fv
    [10., 10., 10.],
    [10., 10., 10.],
    [10., 10., 10.],
    [10., 10., 10.],
]
export default class Pbr extends Pipeline {
    constructor() {
        super()

    }
    init() {
        this.prg = this.compile(vs, fs)
        this.mapPrg = this.compile(vs, mapFs)
    }
    attrib() {

        this.sphere = Geom.sphere(2, 100)

    }
    prepare() {
        this.orbital.radius = 12

    }
    uniform() {


    }
    _setGUI() {
        this.addGUIParams({
            metallic: .5,
            roughness: .5,
            map: 'none',
        })


        this.setRadio('lambertDiffuse', ['lambertDiffuse', 'orenNayarDiffuse'], 'diffuse model')

        let folder1 = this.gui.addFolder('material factor')
        folder1.add(this.params, 'metallic', 0, 1).step(.1)
        folder1.add(this.params, 'roughness', 0, 1).step(.1)
        folder1.open()

        let folder2 = this.gui.addFolder('material map')
        folder2.add(this.params, 'map', ['none', 'plastic', 'wall', 'gold', 'grass', 'rusted_iron', 'wood']).listen().onChange(() => {
            this.setTexture()
        })
        folder2.open()

    }

    setTexture() {
        let map = this.params.map
        if (map === 'none') return

        this.texture0 = getAssets[map + 'Albedo']
        this.texture1 = getAssets[map + 'Roughness']
        this.texture2 = getAssets[map + 'Metallic']
        this.texture3 = getAssets[map + 'Ao']
        this.texture4 = getAssets[map + 'Normal']
    }

    render() {

        GlTools.clear()

        let mMatrix = mat4.create()
        let baseUniforms = {

            lambertDiffuse: this.params.lambertDiffuse,
        }

        if (this.params.map === 'none') {
            this.prg.use()
            for (let i = 0; i < lightPositions.length; i++) {
                this.prg.uniform(`lights[${i}].Type`, 'uniform1i', 1)
                this.prg.style({
                    [`lights[${i}].Position`]: lightPositions[i],
                    [`lights[${i}].Direction`]: [-this.camera.position[0], -this.camera.position[1], -this.camera.position[2]],
                    [`lights[${i}].Color`]: lightColors[i],
                    [`lights[${i}].Linear`]: .1,
                    [`lights[${i}].Quadratic`]: .12,
                    ...baseUniforms,
                    albedo: [.1, .3, .3],
                    ao: .1,
                    metallic: this.params.metallic,
                    roughness: this.params.roughness,
                    mMatrix
                })
    
            }
            GlTools.draw(this.sphere)

        } else {
            this.mapPrg.use()
            this.mapPrg.style({
                ...baseUniforms,
                mMatrix,
                albedoMap: this.texture0,
                roughnessMap: this.texture1,
                metallicMap: this.texture2,
                aoMap: this.texture3,
                normalMap: this.texture4
            })
            GlTools.draw(this.sphere)
        }
    }
}

