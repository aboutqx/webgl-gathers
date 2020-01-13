import getAttribLoc from './utils/getAttribLoc';
import {
  gl, GlTools
} from 'libs/GlTools'
import Texture from 'libs/glTexture'
import Material from 'libs/Material'
import Object3D from 'physics/Object3D'
const STATIC_DRAW = 35044;

const getBuffer = function (attr) {
	let buffer;
	
	if(attr.buffer !== undefined) {
		buffer = attr.buffer;	
	} else {
		buffer = gl.createBuffer();
		attr.buffer = buffer;
	}

	return buffer;
}

export default class Mesh  extends Object3D {
  iBuffer = null
  _useVao = false
  _hasVao = false
  _isInstanced = false
  _bufferChanged = []
  _attributes = [];
	_numInstance 			 = -1;
	_enabledVertexAttribute = [];
		
	_indices                = [];
	_faces                  = [];
	_bufferChanged          = [];
  name = ''
  material = null
  textures = {}
  constructor(mDrawingType, name, material) {
    super()

    this._extVAO                 = !!gl.createVertexArray;
		this._useVAO             	 = !!this._extVAO;
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

  bufferFlattenData(mData, mName, mItemSize) {
    let bufferData = []
    //flatten data
    for (let i = 0; i < mData.length; i++) {
      for (let j = 0; j < mData[i].length; j++) {
        bufferData.push(mData[i][j]);
      }
    }
    this.bufferData(bufferData, mName, mItemSize)
  }

  bufferData(mData, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false) {
    const drawType   = mDrawType;

    let buffer = new ArrayBuffer(gl, new Float32Array(mData))
    if(mData[0]&&mData[0].length) {

      this.bufferFlattenData(mData, mName, mItemSize)

    } else {

      const dataArray = new Float32Array(mData);
      const attribute = this.getAttribute(mName);
  
      
      if(attribute) {	
        //	attribute existed, replace with new data
        attribute.itemSize = mItemSize;
        attribute.dataArray = dataArray;
        attribute.source = mData;
      } else {
        //	attribute not exist yet, create new attribute object
        this._attributes.push({ name:mName, source:mData, itemSize: mItemSize, drawType, dataArray, isInstanced });
      }
  
      this._bufferChanged.push(mName);
      

    }
    return this;
  }

  bufferIndex(mArrayIndices, isDynamic = false) {
    this._drawType        = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
		if(mArrayIndices instanceof Array) {
			this._indices	  = new Uint16Array(mArrayIndices);	
		} else {
			this._indices = mArrayIndices;
		}
		
		this._numItems 		  = this._indices.length;
		return this;

  }

  // 针对多个array buffer，list可以只激活部分attribute, mProgram 指的是glProgram实例
  bind(mShaderProgram) {

    //if(!mShaderProgram) console.error('bind parameter mProgram undefined')
    GlTools.mShaderProgram = mShaderProgram
    //所有data在一个arrybuffer里
    this.generateBuffers(mShaderProgram);

		if(this.hasVAO) {
			gl.bindVertexArray(this.vao); 
		} else {
			this.attributes.forEach((attribute)=> {
				gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
				const attrPosition = attribute.attrPosition;
				gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, 0, 0);

				if(attribute.isInstanced) {
					gl.vertexAttribDivisor(attrPosition, 1);
				}

			});

			//	BIND INDEX BUFFER
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);	
    }
    
    if(this.material instanceof Material) {
      this.material.update()
      return
    }
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

  generateBuffers(mShaderProgram) {
		if(this._bufferChanged.length == 0) { return; }

		if(this._useVAO) { //	IF SUPPORTED, CREATE VAO

			//	CREATE & BIND VAO
			if(!this._vao) {
				this._vao = gl.createVertexArray();	
			}
			
			gl.bindVertexArray(this._vao);

			//	UPDATE BUFFERS
			this._attributes.forEach((attrObj) => {

				if(this._bufferChanged.indexOf(attrObj.name) !== -1) {
					const buffer = getBuffer(attrObj);
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

					const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
					gl.enableVertexAttribArray(attrPosition); 
					gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
					attrObj.attrPosition = attrPosition;

					if(attrObj.isInstanced) {
						gl.vertexAttribDivisor(attrPosition, 1);
					}
				}
				
			});
				
			//	check index buffer
			this._updateIndexBuffer();

			//	UNBIND VAO
			gl.bindVertexArray(null);	
			
			this._hasVAO = true;

		} else { //	ELSE, USE TRADITIONAL METHOD

			this._attributes.forEach((attrObj) => {
				//	SKIP IF BUFFER HASN'T CHANGED
				if(this._bufferChanged.indexOf(attrObj.name) !== -1) {
					const buffer = getBuffer(attrObj);
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

					const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
					gl.enableVertexAttribArray(attrPosition);
					gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
					attrObj.attrPosition = attrPosition;

					if(attrObj.isInstanced) {
						gl.vertexAttribDivisor(attrPosition, 1);
					}
				}
			});

			this._updateIndexBuffer();
		}

		this._hasIndexBufferChanged = false;
		this._bufferChanged = [];
  }
  
  unbind() {
		if(this._useVAO) {
			gl.bindVertexArray(null);	
		}
		
		this._attributes.forEach((attribute)=> {
			if(attribute.isInstanced) {
				gl.vertexAttribDivisor(attribute.attrPosition, 0);
			}
		});
  }

  _updateIndexBuffer() {
		if(!this._hasIndexBufferChanged) {
			if (!this.iBuffer) { this.iBuffer = gl.createBuffer();	 }
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, this._drawType);
			this.iBuffer.itemSize = 1;
			this.iBuffer.numItems = this._numItems;
		}
  }
  
  getAttribute(mName) {	return this._attributes.find((a) => a.name === mName);	}
	getSource(mName) {
		const attr = this.getAttribute(mName);
		return attr ? attr.source : [];
  }
  
  _setMaterial() {
    for(let key in this.material){
      if (this.material[key].constructor === HTMLImageElement) {
        this.material[key] = new Texture(gl).fromImage(this.material[key]).id
        this.textures[key] = this.material[key]
      }
    }
  }

  setMaterial(material) {
    this.material = material
    this.material.update()
  }

  get positionBuffer() {
    let i = has(this._buffers, 'name', 'position')
    if(i === -1) {
      console.warn('no vertex buffer set')
    } else {
      return this._buffers[i].buffer
    }
  }
  	//	GETTER AND SETTERS

	get vertices() {	return this.getSource('position');	}

	get normals() {		return this.getSource('normal');	}

	get coords() {		return this.getSource('texCoord');	}

	get indices() {		return this._indices;	}

	get vertexSize() {	return this.vertices.length;	}

	get faces() {	return this._faces;	}

	get attributes() {	return this._attributes;	}

	get hasVAO() {	return this._hasVAO;	}

	get vao() {	return this._vao;	}

	get numInstance() {	return this._numInstance;	}

	get isInstanced() { return this._isInstanced;	}
}

function has(arr, key, value) { // array child object has key-value
  if (!arr || !arr.length) return -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) return i
  }
  return -1
}
