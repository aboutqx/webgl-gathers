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

const lightPositions = [
    [-10., 10., 10.],
    [10., 10., 10.],
    [-10., -10., 10.],
    [10., -10., 10.],
]
const lightColors = [
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

        this.mesh = getAssets.orb

    }
    prepare() {
        this.orbital.radius = 16
        this.orbital.target = [0, 5, 0]
    }
    uniform() {


    }
    _setGUI() {
        this.addGUIParams({
            map: 'none',
        })

        this.addRadio('orenNayar', ['lambert', 'orenNayar'], 'diffuse model')

        const folder2 = this.gui.addFolder('material map')
        folder2.add(this.params, 'map', ['none', 'plastic', 'wall', 'gold', 'grass', 'rusted_iron', 'wood']).listen().onChange(() => {
            this.setTexture()
        })
        folder2.open()

        this.addPbrParams({
            metallic: .88,
            roughness: .26,
            color: [230,206, 24],
            gamma: 2.2,
            exposure: 1.
        })

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

        const { metallic, lambert, roughness, color, gamma, exposure } = this.params;

        const mMatrix = mat4.create()
        const baseUniforms = {
            uGamma: gamma,
            uExposure: exposure,
            lambertDiffuse: lambert,
        }

        if (this.params.map === 'none') {
            this.prg.use()
            for (let i = 0; i < lightPositions.length; i++) {
                this.prg.uniform(`lights[${i}].Type`, 'uniform1i', 1)
                this.prg.style({
                    [`lights[${i}].Position`]: lightPositions[i],
                    [`lights[${i}].Direction`]: this.camera.position.map(v => -v),
                    [`lights[${i}].Color`]: lightColors[i],
                    [`lights[${i}].Linear`]: .1,
                    [`lights[${i}].Quadratic`]: .12,
                    ...baseUniforms,
                    albedo: color.map(v => v/255),
                    ao: .1,
                    metallic: metallic,
                    roughness: roughness,
                    mMatrix
                })
    
            }
            GlTools.draw(this.mesh)

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
            GlTools.draw(this.mesh)
        }
    }
}

