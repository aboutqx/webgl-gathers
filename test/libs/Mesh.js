import {
  ArrayBuffer,
  IndexBuffer
} from 'libs/glBuffer'
import {
  gl
} from 'libs/GlTools'
import Texture from 'libs/glTexture'
import Vao from 'libs/vao'

export default class Mesh {
  _buffers = []
  iBuffer = null
  _useVao = false
  name = ''
  material = null
  textures = {}
  constructor(mDrawingType, name, material) {
    this.drawingType = mDrawingType
    this.name = name
    if(material) {
      this.material = material
      this._setMaterial()
    }

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
    // support mName as Array, vertex mData like ( vec3 position + vec2 uvs)
    //flatten data
    let bufferData = []
    if(mData[0].length){
      for (let i = 0; i < mData.length; i++) {
        for (let j = 0; j < mData[i].length; j++) {
          bufferData.push(mData[i][j]);
        }
      }
    } else bufferData = mData

    let buffer = new ArrayBuffer(gl, new Float32Array(bufferData))
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

  bufferIndex(mIndex, isDynamic = false) {
    let drawType = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
    this.iBuffer = new IndexBuffer(gl, gl.UNSIGNED_SHORT, new Uint16Array(mIndex), drawType)
  }

  // 针对多个array buffer，list可以只激活部分attribute, mProgram 指的是glProgram实例
  bind(mProgram, list) {

    //if(!mProgram) mProgram = gl.getParameter(gl.CURRENT_PROGRAM)
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
    if (this.textures) {
      let diffuseNr = 1
      let specularNr = 1
      let normalNr = 1
      let heightNr = 1
      let i = 0
      for (let key in this.textures) {
        gl.activeTexture(gl.TEXTURE0 + i)
        let number =''
        if(key === 'diffuseMap') {

          number = (diffuseNr++) + ''
        } else if(key === 'specularMap') {
          number = (specularNr++) + ''
        } else if(key === 'normalMap') {
          number = (normalNr++) + ''
        } else if (key === 'heightMap' || key === 'bumpMap') { // three.js takes bumpMap as heightMap
          number = (heightNr++) + ''
        }
        let tmp = {}
        tmp[key + number] = i
        mProgram.style(tmp)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[key])
        i++
      }
    }
  }

  unbind() {
		if(this._useVAO) {
			gl.bindVertexArray(null);	
		}
		
		this._buffers.forEach((buffer)=> {
      buffer.attribs.forEach((attribute) =>{
        if(attribute.isInstanced) {
          gl.vertexAttribDivisor(attribute.attrPosition, 0)
        }
      })
    })
  }
  
  draw(mDrawingType) {
    let t
    if(!this.iBuffer) {
      t = this._buffers[0].buffer
    } else {
      t = this.iBuffer
    }
    if(this.drawingType) mDrawingType = this.drawingType
    if (!mDrawingType) {
      t.drawTriangles()
    } else {
      t.draw(mDrawingType)
    }
  }

  _setMaterial() {
    for(let key in this.material){
      if (this.material[key].constructor === HTMLImageElement) {
        this.material[key] = new Texture(gl).fromImage(this.material[key]).id
        this.textures[key] = this.material[key]
      }
    }
  }

  get vertexBuffer() {
    let i = has(this._buffers, 'name', 'position')
    if(i === -1) {
      console.warn('no vertex buffer set')
    } else {
      return this._buffers[i].buffer
    }
  }
}
function has(arr, key, value) { // array child object has key-value
  if (!arr || !arr.length) return -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) return i
  }
  return -1
}
