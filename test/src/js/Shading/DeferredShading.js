import Pipeline from '../PipeLine'
import {
    gl,
    canvas,
    GlTools
} from 'libs/GlTools'
import { bigTriangleVert } from 'CustomShaders'
import fs from 'shaders/deferred_shading/finalQuad.frag'
import gBufferVs from 'shaders/deferred_shading/gBuffer.vert'
import gBufferFs from 'shaders/deferred_shading/gBuffer.frag'
import Geom from 'libs/Geom'
import {
    mat4
} from 'gl-matrix'
import FrameBuffer from 'libs/FrameBuffer'
import OBJLoader from 'libs/loaders/ObjLoader'
import MTLLoader from 'libs/loaders/MTLLoader'
const offset = 10.
const objectPositions = [
    [-offset, -offset, -offset],
    [0.0, -offset, -offset],
    [offset, -offset, -offset],
    [-offset, -offset, 0.0],
    [0.0, -offset, 0.0],
    [offset, -offset, 0.0],
    [-offset, -offset, offset],
    [0.0, -offset, offset],
    [offset, -offset, offset]
]
const NR_LIGHTS = 32
const lightPositions = []
const lightColors = []
for (let i = 0; i < NR_LIGHTS; i++) {
    // calculate slightly random offsets
    let xPos = Math.random() * 33 - 16.0;
    let yPos = Math.random() * 10 - 2.0;
    let zPos = Math.random() * 20 - 4.0;
    lightPositions.push([xPos, yPos, zPos]);
    // lightPositions.push()
    // also calculate random color
    let rColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
    let gColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
    let bColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
    lightColors.push([rColor, gColor, bColor]);
}

export default class DeferredShading extends Pipeline {
    count = 0
    constructor() {
        super()

    }
    init() {
        GlTools.applyHdrExtension()
        this.prg = this.compile(bigTriangleVert, fs)
        this.gBufferPrg = this.compile(gBufferVs, gBufferFs)
        this.lampPrg = this.basicColor()

    }
    async attrib() {
        this.cube = Geom.sphere(.3, 40)

        this.quad = Geom.bigTriangle()

        const materials = await new MTLLoader('nanosuit.mtl', './assets/models/nanosuit').parse(getAssets.nanosuitMTL)
        new OBJLoader().load('./assets/models/nanosuit/nanosuit.obj', (o) => {
            this.nanosuit = OBJLoader.parse(o, materials)
        })


    }
    prepare() {
        //position, normal, AlbedoSpec(diffuse, specular indensity)
        this.mrt = new FrameBuffer(canvas.width, canvas.height, { hdr: true }, 3)

        // execute once
        this.orbital.target = [0, -1., 0]
        this.orbital.offset = [1, 3., 0]
        this.orbital.radius = 28
    }
    uniform() {

    }

    render() {
        this.mrt.bind()
            GlTools.clear()

            this.gBufferPrg.use()

            if (this.nanosuit) { // loaded
                for (let i = 0; i < objectPositions.length; i++) {
                    let mMatrix = mat4.create()
                    mat4.translate(mMatrix, mMatrix, objectPositions[i])
                    this.gBufferPrg.style({
                        mMatrix
                    })

                    GlTools.draw(this.nanosuit)

                }
            }
        this.mrt.unbind()

        GlTools.clear()

        this.frameBufferGUI.textureList = [{ texture: this.mrt.getTexture(0) }]

        this.prg.use()
        this.prg.style({
            gPosition: this.mrt.getTexture(0),
            gNormal: this.mrt.getTexture(1),
            gAlbedoSpec: this.mrt.getTexture(2),
            viewPos: this.camera.position
        }, true)
        for (let i = 0; i < lightPositions.length; i++) {
            this.prg.style({
                [`lights[${i}].Position`]: lightPositions[i],
                [`lights[${i}].Color`]: lightColors[i],
                [`lights[${i}].Linear`]: .1,
                [`lights[${i}].Quadratic`]: .12
            })

        }

        GlTools.draw(this.quad)

        // // // copy depth
        // // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.mrt.frameBuffer);
        // // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // write to default framebuffer
        // // // blit to default framebuffer. Note that this may or may not work as the internal formats of both the FBO and default framebuffer have to match.
        // // // the internal formats are implementation defined. This works on all of my systems, but if it doesn't on yours you'll likely have to write to the
        // // // depth buffer in another shader stage (or somehow see to match the default framebuffer's internal format with the FBO's internal format).
        // // gl.blitFramebuffer(0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
        // // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // // render light cubes
        // this.lampPrg.use()
        // for(let i = 0; i < lightPositions.length; i++) {
        //   let mMatrix = mat4.create()
        //   mat4.translate(mMatrix, mMatrix, lightPositions[i])
        //   mat4.scale(mMatrix, mMatrix, [.3, .3, .3])
        //   this.lampPrg.style({
        //     mMatrix,
        //     lightColor: lightColors[i]

        //   })
        //   GlTools.draw(this.cube)
        // }
    }
}
function framebufferMRT(width, height, type) {
    let frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

    let fTexture = []
    const bufferList = []
    for (let i = 0; i < type.length; ++i) {
        fTexture[i] = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, fTexture[i])
        if (type[i] === '16f') {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, fTexture[i], 0)
        bufferList.push(gl.COLOR_ATTACHMENT0 + i)
    }
    gl.drawBuffers(bufferList) // 指定渲染目标

    const depthRenderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer)

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        console.log(`gl.checkFramebufferStatus() returned ${status.toString(16)}`);
    }

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return {
        frameBuffer: frameBuffer,
        depthBuffer: depthRenderBuffer,
        texture: fTexture
    }
}
/*
while (...) // 游戏循环
{
  // 1. 几何处理阶段：渲染所有的几何/颜色数据到G缓冲
  glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  gBufferShader.Use();
  for (Object obj: Objects) {
    ConfigureShaderTransformsAndUniforms();
    obj.Draw();
  }
  // 2. 光照处理阶段：使用G缓冲计算场景的光照
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  glClear(GL_COLOR_BUFFER_BIT);
  lightingPassShader.Use();
  BindAllGBufferTextures();
  SetLightingUniforms();
  RenderQuad();
}

*/
