import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import {
  gl
} from 'libs/GlTools'

export default class Mesh {
  _buffers = []
  iBuffer = null
  _useVao = true
  constructor() {

  }

  bufferVertex(mData) {
    this.bufferData(mData, 'position', 3)
  }

  bufferNormal(mData) {
    this.bufferData(mData, 'normal', 3)
  }

  bufferTexCoord(mData) {
    this.bufferData(mData, 'texCoord', 2)
  }

  bufferColor(mData) {
    this.bufferData(mData, 'color', 4)
  }

  bufferData(mData, mName, mItemSize) {
    // support nName as Array, vertex mData like ( vec3 position + vec2 uvs)
    let buffer = new ArrayBuffer(gl, new Float32Array(mData))
    if(!(mName.constructor === Array)) {

      buffer.attrib(mName, mItemSize, gl.FLOAT)
      this._buffers.push({
        name: mName,
        buffer
      })

    } else {

      for(let i=0; i< mName.length; i++) {
        buffer.attrib(mName[i], mItemSize[i], gl.FLOAT)
      }
      this._buffers.push({
        name: mName.toString(),
        buffer
      })

    }

  }

  bufferIndices(mIndex, isDynamic = false) {
    let drawType = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
    this.iBuffer = new IndexBuffer(gl, gl.UNSIGNED_SHORT, new Uint16Array(mIndex), drawType)
  }

  // 针对多个array buffer，list可以只激活部分attribute
  bind(mProgram, list) {
    //所有data在一个arrybuffer里
    if(this._buffers.length === 1) {
      this._buffers[0].buffer.attribPointer(mProgram, list)

    }else if (!list) {

      for (let i = 0; i < this._buffers.length; i++) {
        this._buffers[i].buffer.attribPointer(mProgram)
      }

    } else {

      for (let i = 0; i < this._buffers.length; i++) {
        for (let j = 0; j < list.length; j++) {
          if (list[j] === this._buffers[i].name)
            this._buffers[i].buffer.attribPointer(mProgram)
        }
      }
      
    }
    if(this.iBuffer) this.iBuffer.bind()
  }

  draw(mDrawingType) {
    let t
    if(!this.iBuffer) {
      t = this._buffers[0].buffer
    } else {
      t = this.iBuffer
    }

    if (!mDrawingType) {
      t.drawTriangles()
    } else {
      t.draw(mDrawingType)
    }
  }
}
