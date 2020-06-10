import Pipeline from '../PipeLine'
import FrameBuffer from 'libs/FrameBuffer'
import terrainVs from 'shaders/water/terrain.vert'
import terrainFs from 'shaders/water/terrain.frag'
import waterVs from 'shaders/water/water.vert'
import waterFs from 'shaders/water/water.frag'
import BatchSkyBox from 'libs/helpers/BatchSkyBox'
import Geom from 'libs/Geom'
import {
    mat4,
    vec3
} from 'gl-matrix'
import {
    gl,
    canvas,
    GlTools,
    toRadian
} from 'libs/GlTools'

export default class Water extends Pipeline {
    constructor() {
        super()

    }
    init() {
        GlTools.applyHdrExtension()
        this.terrainPrg = this.compile(terrainVs, terrainFs)
        this.waterPrg = this.compile(waterVs, waterFs)
    }
    attrib() {
        this.skybox = new BatchSkyBox(400, getAssets.dimskybox)

        const size = 350
        this.terrainPlane = Geom.plane(size, size, 20, 'xz')
        this.waterPlane = Geom.plane(size - 50, size - 50, 100, 'xz')
    }
    prepare() {
        this.orbital.radius = 120
        this.orbital.offset = [0, 22, 18]

        this.terrainTexture = getAssets.terrain
        this.terrainTexture.repeat()


        this._relectionFbo = new FrameBuffer(canvas.width, canvas.height, { hdr: true })
        this._relectionFbo.getTexture().repeat()
    }
    uniform() {
        const mMatrix = mat4.create()
        mat4.translate(mMatrix, mMatrix, [0, -10, 0])
        this.terrainPrg.use()
        this.terrainPrg.style({
            mMatrix,
            texture0: this.terrainTexture
        })

        mat4.identity(mMatrix)
        mat4.translate(mMatrix, mMatrix, [0, -10, 0])
        this.waterPrg.use()
        this.waterPrg.style({
            mMatrix
        })

    }

    _renderScene() {
        this.skybox.draw()

        this.terrainPrg.use()
        this.terrainPrg.style({
            waterRadius: 90,
            terrainHeight: 20
        })
        GlTools.draw(this.terrainPlane)


    }

    render() {
        GlTools.clear()

        this._relectionFbo.bind()
        GlTools.clear(0, 0, 0)

        this.orbital.flipY()
        this._renderScene()

        this._relectionFbo.unbind()


        this.orbital.flipY()
        this.frameBufferGUI.textureList = [{ texture: this._relectionFbo.getTexture(), flipY: true }]
        this._renderScene()

        this.waterPrg.use()
        const speed = 0.1
        // console.log(performance.now() / 1000 * speed)
        this.waterPrg.style({
            reflectionTetxture: this._relectionFbo.getTexture(),
            dudvMap: getAssets.dudvMap,
            count: performance.now() / 1000 * speed,
            waveStrength: 0.02,
            normalMap: getAssets.matchingNormalMap,
            lightColor: [1., 1., 1.],
            lightPositon: [10., 10., 10.]
        })
        GlTools.draw(this.waterPlane)

    }
}
