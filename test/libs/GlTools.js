import Mesh from './Mesh';
import Object3D from 'physics/Object3D';
import { mat3, mat4 } from 'gl-matrix'

const canvas = document.querySelector('canvas')
const options = {
    antialias: false,
    stencil: true
}


const gl = canvas.getContext('webgl2', options)
if (!gl) console.error('webgl2 not supported!')
console.log('webgl2 used.')
window.useWebgl2 = true


const toRadian = (deg) => {
    return deg / 180 * Math.PI
}

class GlTool {
    shader
    shaderProgram
    identityMatrix = mat4.create()
    _normalMatrix = mat3.create()
    _inverseModelViewMatrix = mat3.create()
    _modelMatrix
    aspectRatio
    constructor() {
        this.customUniforms = [
            'uProjectionMatrix',
            'uViewMatrix',
            'uCameraPos',
            'uNormalMatrix',
            'uModelViewMatrixInverse',
            'uTime',
            'uModelMatrix'
        ]
    }

    clear(r = .3, g = .3, b = .3, a = 1) {
        gl.clearColor(r, g, b, a)
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    customGlState() {
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.enable(gl.CULL_FACE)

    }

    applyHdrExtension() {
        gl.getExtension("EXT_color_buffer_float")
        gl.getExtension('OES_texture_half_float_linear')
        gl.getExtension('OES_texture_float_linear')
    }

    srcBlend() {
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    }

    setCamera(camera) {
        this.camera = camera
    }

    resize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        this.aspectRatio = canvas.width / canvas.height

        this.camera.setAspectRatio(this.aspectRatio);

        gl.viewport(0, 0, canvas.width, canvas.height);	
    }

    useShader(shader) {
        this.shader = shader
        this.shaderProgram = this.shader.shaderProgram
        this.shaderName = this.shader.name
    }

    drawMesh(mMesh, modelMatrix) {
        const { material } = mMesh
        // instancing use batchInstance shader
        if (material && material.update && !(mMesh.isInstanced)) {
            material.update()
            if (material.doubleSided) {
                gl.disable(gl.CULL_FACE)
            }
        }

        mMesh.bind(this.shaderProgram);
        // console.log(this.shader.name, mMesh)
        if (this.shader) {
            if(!this.camera) console.error('no camera set')
            //	DEFAULT UNIFORMS
            const customUniforms = {
                'uProjectionMatrix': this.camera.projectionMatrix,
                'uViewMatrix': this.camera.viewMatrix,
                'uCameraPos': this.camera.position,
                'uNormalMatrix': this._normalMatrix,
                'uModelViewMatrixInverse': this._inverseModelViewMatrix,
                'uTime': performance.now()
            }
            this.shader.style(customUniforms)
            if (!modelMatrix) this.shader.uniform('uModelMatrix', 'mat4', mMesh.matrix);

        }

        const drawType = mMesh.drawType;
        const IndexType = mMesh.indices.constructor === Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT

        if (mMesh.isInstanced) {
            gl.drawElementsInstanced(mMesh.drawType, mMesh.iBuffer.numItems, IndexType, 0, mMesh.numInstance);
        } else {
            if (drawType === gl.POINTS) {
                gl.drawArrays(drawType, 0, mMesh.vertexSize);
            } else {
                gl.drawElements(drawType, mMesh.iBuffer.numItems, IndexType, 0);
            }
        }

        mMesh.unbind();
        gl.enable(gl.CULL_FACE)
    }


    // drawMesh(mMesh) {
    //   const { material, geometry } = mMesh;

    //   if(material.doubleSided) {
    //     this.disable(GL.CULL_FACE);
    //   } else {
    //     this.enable(GL.CULL_FACE);
    //   }

    //   material.update();
    //   this.drawGeometry(geometry, mMesh.matrix);
    // }


    draw(mObj, modelMatrix) { // modelMatrix flag determine if pass the uNormalMatrix mannully, default is undefined which passes false
        if (!mObj) return
        if (mObj.length) {
            for (let i = 0; i < mObj.length; i++) {
                this.draw(mObj[i], modelMatrix);
            }
            return;
        }
        if (mObj instanceof Mesh) {
            this.drawMesh(mObj, modelMatrix);
        } else if (mObj instanceof Object3D) {

            mObj.updateMatrix();
            mObj.children.forEach(child => {
                this.draw(child);
            });
        }
    }
}
let GlTools = new GlTool()
export { gl, canvas, toRadian, GlTools }
