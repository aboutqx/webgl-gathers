/*
 https://developer.download.nvidia.cn/CgTutorial/cg_tutorial_chapter07.html
*/
import Pipeline from '../PipeLine'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import sVs from 'shaders/env_map/env_specular.vert'
import sFs from 'shaders/env_map/env_specular.frag'
import rVs from 'shaders/env_map/env_refract.vert'
import rFs from 'shaders/env_map/env_refract.frag'
import fVs from 'shaders/env_map/fresnell_chromatic.vert'
import fFs from 'shaders/env_map/fresnell_chromatic.frag'
import {
    mat4
} from 'gl-matrix'
import {
    GlTools
} from 'libs/GlTools'

export default class EnvMap extends Pipeline {
    constructor() {
        super()

    }
    init() {

        this.specularPrg = this.compile(sVs, sFs)
        this.refractPrg = this.compile(rVs, rFs)
        this.frenellPrg = this.compile(fVs, fFs)
    }
    attrib() {
        this.skybox = new BatchSkyBox(40, getAssets.skyboxlake)
        this.skyboxMap = getAssets.skyboxlake

    }
    prepare() {


        this.venus = getAssets.venus

        this.orbital.radius = 19
        this.orbital.target = [0, 5, 0]
    }
    uniform() {


    }
    render() {

        GlTools.clear()
        this.skybox.draw()

        let mMatrix = mat4.create()
        mat4.translate(mMatrix, mMatrix, [-6, 0, 0])
        this.specularPrg.use()
        this.specularPrg.style({
            mMatrix: mMatrix,
            skybox: this.skyboxMap,
            cameraPos: this.camera.position,
            aoMap: getAssets.venusAo
        })
        GlTools.draw(this.venus)

        mMatrix = mat4.create()
        mat4.translate(mMatrix, mMatrix, [6, 0, 0])
        this.refractPrg.use()
        this.refractPrg.style({
            mMatrix: mMatrix,
            skybox: this.skyboxMap,
            cameraPos: this.camera.position,
            aoMap: getAssets.venusAo
        })
        GlTools.draw(this.venus)

        mMatrix = mat4.create()
        mat4.translate(mMatrix, mMatrix, [0, 0, 0])
        this.refractPrg.use()
        this.refractPrg.style({
            mMatrix: mMatrix,
            skybox: this.skyboxMap,
            cameraPos: this.camera.position,
            etaRatio: [.65, .67, .69],
            fresnelPower: .8,
            fresnelBias: .1,
            fresnelScale: .9
        })
        GlTools.draw(this.venus)


    }
}

