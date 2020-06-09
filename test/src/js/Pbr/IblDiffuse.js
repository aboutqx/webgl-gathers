import Pipeline from '../PipeLine'
import {
    gl,
    canvas,
    toRadian,
    GlTools
} from 'libs/GlTools'
import fs from 'shaders/ibl_diffuse/pbr_ibl.frag'
import mapFs from 'shaders/pbr/pbr_map.frag'
import cubeFs from 'libs/glsl/equirectangular_to_cubemap.frag'
import irradianceFs from 'shaders/ibl_diffuse/irradiance_convolution.frag'
import {
    mat4,
    vec3
} from 'gl-matrix'
import Geom from 'libs/Geom'
import CubeFrameBuffer from 'libs/CubeFrameBuffer'

//ibl diffuse即irradiance，为normal正交的平面上半球内所有方向的平均颜色微分
export default class IblDiffuse extends Pipeline {
    constructor() {
        super()

    }
    init() {
        GlTools.applyHdrExtension()
        this.prg = this.basicVert(fs)
        this.mapPrg = this.basicVert(mapFs)
        this.cubePrg = this.basicVert(cubeFs)
        this.irradiancePrg = this.basicVert(irradianceFs)
    }
    attrib() {

        this.sphere = Geom.sphere(2, 100)

        this.cube = Geom.cube(2)

    }
    prepare() {

        this.orbital.radius = 32

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)


        this.hdrTexture = getAssets.equirectangular
        // this.hdrTexture.clamp()

        let cubemapTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

        for (var i = 0; i < 6; i++) {
            //r,l,u,d,b,f 为6个面指定空数据
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA16F, 512, 512, 0, gl.RGBA, gl.FLOAT, null)
        }
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        this.cubemapTexture = cubemapTexture

        // render 6 faces to framebuffer
        this.cubePrg.use()
        this.hdrTexture.bind(0)

        let pMatrix = mat4.create()
        let mMatrix = mat4.create()
        let vMatrix = mat4.create()
        let vpMatrix = mat4.create()

        mat4.perspective(pMatrix, toRadian(90), 1., .1, 100)
        const CAMERA_SETTINGS = [
            [vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0)],
            [vec3.fromValues(0, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0)],
            [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)],
            [vec3.fromValues(0, 0, 0), vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1)],
            [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0)],
            [vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0)]
        ]
        gl.viewport(0, 0, 512, 512)
        let captureFrameBuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, captureFrameBuffer)

        for (let i = 0; i < 6; i++) {
            mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
            mat4.multiply(vpMatrix, pMatrix, vMatrix)
            this.cubePrg.style({
                equirectangularMap: 0,
                vpMatrix,
                mMatrix: mMatrix
            })
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, this.cubemapTexture, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            GlTools.draw(this.cube)
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        this.irradiancePrg.use()
        let irradianceFbo = new CubeFrameBuffer(32)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture); // 放在这，防止new cubeframebuffer时绑定了tetxure0到null

        for (let i = 0; i < 6; i++) {
            mat4.lookAt(vMatrix, CAMERA_SETTINGS[i][0], CAMERA_SETTINGS[i][1], CAMERA_SETTINGS[i][2])
            mat4.multiply(vpMatrix, pMatrix, vMatrix)
            this.irradiancePrg.style({
                environmentMap: 0,
                vpMatrix,
                mMatrix: mMatrix
            })
            irradianceFbo.bind(i)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


            GlTools.draw(this.cube)
        }
        irradianceFbo.unbind()
        this.irradianceFbo = irradianceFbo
    }
    uniform() {


    }
    _setGUI() {
        this.addGUIParams({
            roughness: 0.2,
            metallic: 6 / 7,
            map: 'none',
        })

        let folder = this.gui.addFolder('material param')
        folder.add(this.params, 'roughness', 0.05, 1).step(0.01)
        folder.add(this.params, 'metallic', 0, 6 / 7).step(0.01)
        folder.open()

        this.addRadio('lambertDiffuse', ['lambertDiffuse', 'orenNayarDiffuse'], 'diffuse model')

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
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0.3, 0.3, 0.3, 1.);
        gl.clearDepth(1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        let mMatrix = mat4.create()
        let baseUniforms = {
            mMatrix,
            lightPositions: [ // use flatten array for gl.uniform3fv
                -10., 10., 10.,
                10., 10., 10.,
                -10., -10., 10.,
                10., -10., 10.,
            ],
            lightColors: new Array(12).fill(300.),
            lambertDiffuse: this.params.lambertDiffuse,
            irradianceMap: 0
        }

        if (this.params.map === 'none') {
            this.prg.use()
            this.irradianceFbo.getTexture().bind(0)
            this.prg.style({
                ...baseUniforms,
                albedo: [.5, .0, .0],
                roughness: this.params.roughness,
                metallic: this.params.metallic,
                ao: 1.
            })

        } else {
            this.mapPrg.use()

            this.mapPrg.style({
                ...baseUniforms,
                albedoMap: this.texture0,
                roughnessMap: this.texture1,
                metallicMap: this.texture2,
                aoMap: this.texture3,
                normalMap: this.texture4
            })

        }



        // this.planeVao.bind()
        // this.planeBuffer.drawTriangles()
        // this.planeVao.unbind()


        GlTools.draw(this.sphere)
    }
}
