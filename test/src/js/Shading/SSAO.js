import Pipeline from '../PipeLine'
import {
    gl,
    canvas,
    GlTools
} from 'libs/GlTools'
import { bigTriangleVert } from 'CustomShaders'
import gBufferVs from 'shaders/ssao/ssao_geometry.vert'
import gBufferFs from 'shaders/ssao/ssao_geometry.frag'
import ssaoFs from 'shaders/ssao/ssao.frag'
import ssaoBlurFs from 'shaders/ssao/ssao_blur.frag'
import ssaoLightingFs from 'shaders/ssao/ssao_lighting.frag'

import {
    mat4, vec3
} from 'gl-matrix'
import OBJLoader from 'libs/loaders/ObjLoader'
import MTLLoader from 'libs/loaders/MTLLoader'
import FrameBuffer from 'libs/FrameBuffer'
import Texture from 'libs/GLTexture'
import Geom from 'libs/Geom'


const lightPositions = [0, -1, 0]
const lightColors = [.2, .2, .7]
const kernelSize = 64
let ssaoKernel = new Float32Array(64 * 3)
let ssaoNoise = new Float32Array(16 * 3)
const generateSample = () => {
    for (let i = 0; i < kernelSize; i++) {
        let sample = vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random())
        ssaoKernel[i * 3] = sample[0]
        ssaoKernel[i * 3 + 1] = sample[1]
        ssaoKernel[i * 3 + 2] = sample[2]
    }
}
const generateNoise = () => {
    for (let i = 0; i < 16; i++) {
        let noise = vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, 0)
        ssaoNoise[i * 3] = noise[0]
        ssaoNoise[i * 3 + 1] = noise[1]
        ssaoNoise[i * 3 + 2] = noise[2]
    }
}
export default class SSAO extends Pipeline {
    constructor() {
        super()

    }
    init() {

        GlTools.applyHdrExtension()
        this.gBufferPrg = this.compile(gBufferVs, gBufferFs)
        this.ssaoPrg = this.compile(bigTriangleVert, ssaoFs)
        this.blurPrg = this.compile(bigTriangleVert, ssaoBlurFs)
        this.prg = this.compile(bigTriangleVert, ssaoLightingFs)
    }
    async attrib() {

        this.cube = Geom.cube(5)

        this.bigTriangle = Geom.bigTriangle()

        const materials = await new MTLLoader('nanosuit.mtl', './assets/models/nanosuit').parse(getAssets.nanosuitMTL)
        new OBJLoader().load('./assets/models/nanosuit/nanosuit.obj', (o) => {
            this.nanosuit = OBJLoader.parse(o, materials)
        })

    }
    prepare() {

        //position, normal, AlbedoSpec(diffuse, specular indensity)
        this.mrt = new FrameBuffer(canvas.width, canvas.height, { hdr: true }, 3)
        this.ssaoFbo = new FrameBuffer()
        this.blurFbo = new FrameBuffer()


        generateSample()
        generateNoise()
        this.noiseTexture = new Texture(ssaoNoise, { format: gl.RGB }, 4, 4)
        this.noiseTexture.repeat()
        // execute once
        this.orbital.target = [0, -1., 0]
        this.orbital.radius = 8

        gl.disable(gl.CULL_FACE)

    }
    uniform() {
        this.frameBufferGUI.textureList = [{ texture: this.noiseTexture }]

    }
    _renderScene() {
        GlTools.clear()
        this.gBufferPrg.use()
        if (this.nanosuit) { // loaded
            let mMatrix = mat4.create()
            mat4.translate(mMatrix, mMatrix, [-1.0, -3.3, 3.])
            mat4.scale(mMatrix, mMatrix, [.4, .4, .4])
            mat4.rotate(mMatrix, mMatrix, -Math.PI / 2, [1, 0, 0])

            this.gBufferPrg.style({
                mMatrix,
                invertedNormals: 0
            })
            GlTools.draw(this.nanosuit)
        }

        let mMatrix = mat4.create()
        mat4.scale(mMatrix, mMatrix, [8, 4, 8])
        this.gBufferPrg.style({
            mMatrix,
            invertedNormals: 1
        })
        GlTools.draw(this.cube)
    }
    render() {

        this.mrt.bind()
            this._renderScene()
        this.mrt.unbind()

        this.ssaoFbo.bind()

            this.ssaoPrg.use()
            this.ssaoPrg.style({
                gPosition: this.mrt.getTexture(0),
                gNormal: this.mrt.getTexture(1),
                texNoise: this.noiseTexture,
                samples: ssaoKernel,
            })
            GlTools.draw(this.bigTriangle)
        this.ssaoFbo.unbind()

        this.blurFbo.bind()

            this.blurPrg.use()
            this.blurPrg.style({
                ssaoInput: this.ssaoFbo.getTexture()
            })
            GlTools.draw(this.bigTriangle)
        this.blurFbo.unbind()

        GlTools.clear()

        this.prg.use()
        this.prg.style({
            gPosition: this.mrt.getTexture(0),
            gNormal: this.mrt.getTexture(1),
            gAlbedoSpec: this.mrt.getTexture(2),
            ssao: this.blurFbo.getTexture(),
            'lights.Position': lightPositions,
            'lights.Color': lightColors,
            'lights.Linear': .09,
            'lights.Quadratic': .032
        })

        GlTools.draw(this.bigTriangle)

    }
}

/*
  // 几何处理阶段: 渲染到G缓冲中
  glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
  [...]
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  // 使用G缓冲渲染SSAO纹理
  glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);
  glClear(GL_COLOR_BUFFER_BIT);
  shaderSSAO.Use();
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, gPositionDepth);
  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, gNormal);
  glActiveTexture(GL_TEXTURE2);
  glBindTexture(GL_TEXTURE_2D, noiseTexture);
  SendKernelSamplesToShader();
  glUniformMatrix4fv(projLocation, 1, GL_FALSE, glm::value_ptr(projection));
  RenderQuad();
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  // 光照处理阶段: 渲染场景光照
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  shaderLightingPass.Use();
  [...]
  glActiveTexture(GL_TEXTURE3);
  glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
  [...]
  RenderQuad();
*/
