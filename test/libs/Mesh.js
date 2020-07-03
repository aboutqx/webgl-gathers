import getAttribLoc from './utils/getAttribLoc';
import {
    gl, GlTools
} from 'libs/GlTools'
import Texture from 'libs/GLTexture'
import Object3D from 'physics/Object3D'
import { vec3 } from 'gl-matrix'
const STATIC_DRAW = 35044;

const allEqual = (array1, array2) => {
    if (array1.join(',') === array2.join(',')) {
        return true
    } else return false
}
const getBuffer = function (attr) {
    let buffer;

    if (attr.buffer !== undefined) {
        buffer = attr.buffer;
    } else {
        buffer = gl.createBuffer();
        attr.buffer = buffer;
    }

    return buffer;
}

export default class Mesh extends Object3D {
    iBuffer = null
    _isInstanced = false
    _bufferChanged = []
    _attributes = [];
    _numInstance = -1;
    _enabledVertexAttribute = [];

    _indices = [];
    _faces = [];
    _bufferChanged = [];
    name = ''
    material = null
    textures = {}
    constructor(mDrawingType = gl.TRIANGLES, name, material) {
        super()

        this._extVAO = !!gl.createVertexArray;
        this._useVAO = !!this._extVAO;
        this.drawType = mDrawingType
        this.name = name
        if (material) {
            this.setMaterial(material)
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

    formBuffer(mData, mNum) {
        const ary = [];
    
        for (let i = 0; i < mData.length; i += mNum) {
            const o = [];
            for (let j = 0; j < mNum; j++) {
                o.push(mData[i + j]);
            }
    
            ary.push(o);
        }
    
        return ary;
    }

    bufferFlattenData(mData, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false) {
        const data = this.formBuffer(mData, mItemSize);
        this.bufferData(data, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false);
        return this;

    }

    bufferData(mData, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false) {
        const drawType = mDrawType;
        let bufferData = []

        this._isInstanced = isInstanced || this._isInstanced
        //	flatten buffer data
        for (let i = 0; i < mData.length; i++) {
            for (let j = 0; j < mData[i].length; j++) {
                bufferData.push(mData[i][j]);
            }
        }

        const dataArray = new Float32Array(bufferData);
        const attribute = this.getAttribute(mName);


        if (attribute) {
            //	attribute existed, replace with new data
            attribute.itemSize = mItemSize;
            attribute.dataArray = dataArray;
            attribute.source = mData;
        } else {
            //	attribute not exist yet, create new attribute object
            this._attributes.push({ name: mName, source: mData, itemSize: mItemSize, drawType, dataArray, isInstanced });
        }
        this._bufferChanged.push(mName);


        return this;
    }

    bufferIndex(mArrayIndices, isDynamic = false) {
        this._drawType = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
        if (mArrayIndices instanceof Array) {
            this._indices = mArrayIndices.length > 65535 ? new Uint32Array(mArrayIndices) : new Uint16Array(mArrayIndices)
        } else {
            this._indices = mArrayIndices;
        }

        this._numItems = this._indices.length;
        return this;

    }

    // when use dynamic draw we can change the buffer data use bufferSubData
    // https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html

    bufferInstance(mData, mName, mDrawType = STATIC_DRAW) {
        if (!gl.vertexAttribDivisor) {
            console.error('Extension : ANGLE_instanced_arrays is not supported with this device !');
            return;
        }

        const itemSize = mData[0].length;
        this._numInstance = mData.length;

        this.bufferData(mData, mName, itemSize, mDrawType, true);
    }

    // 针对多个array buffer，list可以只激活部分attribute, mProgram 指的是glProgram实例
    bind(mShaderProgram) {
        if (!mShaderProgram) console.error('no current program used')

        //所有data在一个arrybuffer里（现在不支持了）
        this.generateBuffers(mShaderProgram);

        if (this.hasVAO) {
            gl.bindVertexArray(this.vao);
        } else {
            this.attributes.forEach((attribute) => {
                gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
                const attrPosition = attribute.attrPosition;
                gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, 0, 0);

                if (attribute.isInstanced) {
                    gl.vertexAttribDivisor(attrPosition, 1);
                }

            });

            //	BIND INDEX BUFFER
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        }

        if (this.textures) {
            // key: diffuseMap, specularMap, normalMap, heightMap, bumpMap # three.js takes bumpMap as heightMap

            GlTools.shader.style(this.textures)

        }
    }

    generateBuffers(mShaderProgram) {
        if (this._bufferChanged.length == 0) { return; }

        if (this._useVAO) { //	IF SUPPORTED, CREATE VAO

            //	CREATE & BIND VAO
            if (!this._vao) {
                this._vao = gl.createVertexArray();
            }

            gl.bindVertexArray(this._vao);

            //	UPDATE BUFFERS
            this._attributes.forEach((attrObj) => {

                if (this._bufferChanged.indexOf(attrObj.name) !== -1) {
                    const buffer = getBuffer(attrObj);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

                    const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name)

                    if (attrPosition < 0) { console.log('attribute pos:', attrPosition, attrObj.name, 'shaderName:', GlTools.shaderName); return }
                    attrObj.attrPosition = attrPosition;

                    if (attrObj.isInstanced && attrObj.source[0].length > 4) {
                        // matrix attribute
                        for (let i = 0; i < 4; ++i) {
                            gl.enableVertexAttribArray(attrPosition + i);
                            gl.vertexAttribPointer(attrPosition + i, 4, gl.FLOAT, false, 64, i * 16);
                            gl.vertexAttribDivisor(attrPosition + i, 1);
                        }
                        return
                    }

                    gl.enableVertexAttribArray(attrPosition);
                    gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);

                    if (attrObj.isInstanced) {
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
                if (this._bufferChanged.indexOf(attrObj.name) !== -1) {
                    const buffer = getBuffer(attrObj);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

                    const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
                    gl.enableVertexAttribArray(attrPosition);
                    gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
                    attrObj.attrPosition = attrPosition;

                    if (attrObj.isInstanced) {
                        gl.vertexAttribDivisor(attrPosition, 1);
                    }
                }
            });

            this._updateIndexBuffer();
        }

        this._hasIndexBufferChanged = false;
        this._bufferChanged = [];
    }

    bufferSubData(mName, mData, mOffset = 0) {
        const attr = this.getAttribute(mName)
        if (!attr.buffer) return

        let bufferData = []
        for (let i = 0; i < mData.length; i++) {
            for (let j = 0; j < mData[i].length; j++) {
                bufferData.push(mData[i][j]);
            }
        }

        const dataArray = new Float32Array(bufferData);
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, mOffset, dataArray);
    }

    unbind() {
        if (this._useVAO) {
            gl.bindVertexArray(null);
        }

        this._attributes.forEach((attribute) => {
            if (attribute.isInstanced) {
                gl.vertexAttribDivisor(attribute.attrPosition, 0);
            }
        });
    }

    _updateIndexBuffer() {
        if (!this._hasIndexBufferChanged) {
            if (!this.iBuffer) { this.iBuffer = gl.createBuffer(); }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, this._drawType);
            this.iBuffer.itemSize = 1;
            this.iBuffer.numItems = this._numItems;
        }
    }
    computeNormals(normals, usingFaceNormals = false) {

        if (usingFaceNormals) {
            this.generateFaces(normals);
            //this._computeFaceNormals();
        } else {
            this._computeVertexNormals(normals);
        }
    }

    //	PRIVATE METHODS

    _computeFaceNormals() {

        let faceIndex;
        let face;
        const normals = [];

        for (let i = 0; i < this._indices.length; i += 3) {
            faceIndex = i / 3;
            face = this._faces[faceIndex];
            const N = face.normal;

            normals[face.indices[0]] = N;
            normals[face.indices[1]] = N;
            normals[face.indices[2]] = N;
        }

        this.bufferNormal(normals);
    }


    _computeVertexNormals(normals) {
        //	loop through all vertices
        let face;
        const sumNormal = vec3.create();
        const averageNormals = [];
        const { vertices } = this;
        // vertices with the same position they have the same average normal,each is averaged from adjacent 3 faces normals
        // so we need to know 3 adjacent faces for each vertices, although vertices may have the same position
        //since the indices is not reused , we can't find theses 3 faces there
        //we can simplely loop vertices, for each if them in the faces, wo get face normals
        //then we have 3 faces normals for each vertices. finally average them unweighted
        let count = 0
        for (let i = 0; i < vertices.length; i++) {

            vec3.set(sumNormal, 0, 0, 0);

            for (let j = 0; j < vertices.length; j++) {
                if (allEqual(vertices[i], vertices[j])) {

                    sumNormal[0] += normals[j][0];
                    sumNormal[1] += normals[j][1];
                    sumNormal[2] += normals[j][2];
                    count++
                }

            }
            vec3.divide(sumNormal, sumNormal, vec3.fromValues(count, count, count))
            vec3.normalize(sumNormal, sumNormal);
            averageNormals.push([sumNormal[0], sumNormal[1], sumNormal[2]]);
            count = 0
        }
        this.bufferNormal(averageNormals);

    }


    generateFaces(normals) {
        let ia, ib, ic;
        let a, b, c;
        let na, nb, nc;
        const vba = vec3.create(), vca = vec3.create(), vNormal = vec3.create();
        const { vertices } = this;

        for (let i = 0; i < this._indices.length; i += 3) {

            ia = this._indices[i];
            ib = this._indices[i + 1];
            ic = this._indices[i + 2];

            a = vertices[ia];
            b = vertices[ib];
            c = vertices[ic];

            na = normals[ia];
            nb = normals[ib];
            nc = normals[ic];

            const face = {
                indices: [ia, ib, ic],
                vertices: [a, b, c],
                normals: [na, nb, nc]
            };

            this._faces.push(face);
        }

    }

    getAttribute(mName) { return this._attributes.find((a) => a.name === mName); }
    getSource(mName) {
        const attr = this.getAttribute(mName);
        return attr ? attr.source : [];
    }

    _setMatTexture() {

        for (let key in this.material) {
            if (this.material[key].constructor === HTMLImageElement) {
                this.textures[key] = new Texture(this.material[key], { wrapS: gl.REPEAT, wrapT: gl.REPEAT })
            }
        }
    }

    setMaterial(material) {
        this.material = material
        this._setMatTexture()
    }

    //	GETTER AND SETTERS

    get vertices() { return this.getSource('position'); }

    get normals() { return this.getSource('normal'); }

    get coords() { return this.getSource('texCoord'); }

    get indices() { return this._indices; }

    get vertexSize() { return this.vertices.length; }

    get faces() { return this._faces; }

    get attributes() { return this._attributes; }

    get hasVAO() { return this._hasVAO; }

    get vao() { return this._vao; }

    get numInstance() { return this._numInstance; }

    get isInstanced() { return this._isInstanced; }

}