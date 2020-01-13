import Mesh from './Mesh';
import Object3D from 'physics/Object3D';

const canvas = document.querySelector('canvas')
const options = {
  antialias: false,
  stencil: true
}
const name = location.search.replace('?', '').toLocaleLowerCase()
let gl
if (name !== 'mrt' && name !== 'mirror' && name !== 'pbr' && name !== 'ibl' ) {
  gl = canvas.getContext('webgl2', options)
  if (!gl) console.warn('webgl2 not supported!')
  console.log('webgl2 used.')
  window.useWebgl2 = true
} else gl = canvas.getContext('webgl', options)

const toRadian = (deg) => {
  return deg / 180 * Math.PI
}

const canvasWidth = canvas.width
const canvasHeight = canvas.height

class GlTool{
  shaderProgram= null

  drawMesh(mGeometry, modelMatrix) {
    if(mGeometry.length) {
      for(let i = 0; i < mGeometry.length; i++) {
        this.draw(mGeometry[i]);
      }
      return;
    }

    mGeometry.bind(this.shaderProgram);

    if(this.shader){
      //	DEFAULT UNIFORMS
      if(this.camera !== undefined) {
        this.shader.uniform('uProjectionMatrix', 'mat4', this.camera.projection);	
        this.shader.uniform('uViewMatrix', 'mat4', this.camera.matrix);
      }
      
      this.shader.uniform('uCameraPos', 'vec3', this.camera.position);
      this.shader.uniform('uModelMatrix', 'mat4', modelMatrix || this._modelMatrix);
      this.shader.uniform('uNormalMatrix', 'mat3', this._normalMatrix);
      this.shader.uniform('uModelViewMatrixInverse', 'mat3', this._inverseModelViewMatrix);
    }
   

    const drawType = mGeometry.drawType;

    if(mGeometry.isInstanced) {
      gl.drawElementsInstanced(mGeometry.drawType, mGeometry.iBuffer.numItems, gl.UNSIGNED_SHORT, 0, mGeometry.numInstance);
    } else {
      if(drawType === gl.POINTS) {
        gl.drawArrays(drawType, 0, mGeometry.vertexSize);	
      } else {
        gl.drawElements(drawType, mGeometry.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
      }	
    }

    mGeometry.unbind();
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


draw(mObj){
    if(mObj instanceof Mesh) {
      this.drawMesh(mObj);
    } else if(mObj instanceof Object3D) {
      
      mObj.updateMatrix();
      mObj.children.forEach(child => {
        this.draw(child);
      });
    }
  }
}
let GlTools = new GlTool()
export { gl, canvas, toRadian, canvasWidth, canvasHeight, GlTools }
