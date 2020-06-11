// Object3D.js

import { vec3, mat4, quat, mat3 } from 'gl-matrix';
import Mesh from 'libs/Mesh'
import { AABB, OBB } from './Geometry3D'

class Object3D {
    name = ''
    _originalMatrix
    constructor() {
        this._needUpdate = true;

        this._x = 0;
        this._y = 0;
        this._z = 0;

        this._sx = 1;
        this._sy = 1;
        this._sz = 1;

        this._rx = 0;
        this._ry = 0;
        this._rz = 0;

        this._position = vec3.create();
        this._scale = vec3.fromValues(1, 1, 1);
        this._rotation = vec3.create();

        this._matrix = mat4.create();
        this._matrixParent = mat4.create();
        this._matrixRotation = mat4.create();
        this._matrixScale = mat4.create();
        this._matrixTranslation = mat4.create();
        this._matrixQuaternion = mat4.create();
        this._quat = quat.create();

        this._children = [];
    }

    updateMatrix() {
        if (!this._needUpdate) { return; }

        vec3.set(this._scale, this._sx, this._sy, this._sz);
        vec3.set(this._rotation, this._rx, this._ry, this._rz);
        vec3.set(this._position, this._x, this._y, this._z);

        mat4.identity(this._matrixTranslation);
        mat4.identity(this._matrixScale);
        mat4.identity(this._matrixRotation);


        mat4.rotateX(this._matrixRotation, this._matrixRotation, this._rx);
        mat4.rotateY(this._matrixRotation, this._matrixRotation, this._ry);
        mat4.rotateZ(this._matrixRotation, this._matrixRotation, this._rz);


        mat4.fromQuat(this._matrixQuaternion, this._quat);

        mat4.mul(this._matrixRotation, this._matrixQuaternion, this._matrixRotation);

        mat4.scale(this._matrixScale, this._matrixScale, this._scale);
        mat4.translate(this._matrixTranslation, this._matrixTranslation, this._position);

        mat4.mul(this._matrix, this._matrixTranslation, this._matrixRotation);
        mat4.mul(this._matrix, this._matrix, this._matrixScale);
        mat4.mul(this._matrix, this._matrixParent, this._matrix);

        if (this._originalMatrix) mat4.mul(this._matrix, this._matrix, this._originalMatrix)

        this._children.forEach(child => {
            child.updateParentMatrix(this._matrix);
        });

        this._needUpdate = false;
    }

    updateParentMatrix(mParentMatrix) {
        mParentMatrix = mParentMatrix || mat4.create();

        mat4.copy(this._matrixParent, mParentMatrix);
        this._needUpdate = true;
    }

    setRotationFromQuaternion(mQuat) {
        quat.copy(this._quat, mQuat);
        this._needUpdate = true;
    }


    addChild(mChild) {
        this._children.push(mChild);
    }

    removeChild(mChild) {
        const index = this._children.indexOf(mChild);
        if (index == -1) { console.warn('Child no exist'); return; }

        this._children.splice(index, 1);
    }

    boundingAABB() {
        if(this instanceof Mesh) {
            return AABB.fromVertices(this.vertices)
        }
    }

    boundingOBB() {
        const aabb = this.boundingAABB()
        if(aabb) {
            let obb = new OBB()
            obb.size = aabb.size
            let t = vec4.create()
            vec4.transformMat4(t, vec4.fromVec3(aabb.position), this.matrix)
            obb.position = vec3.fromValues(t[0], t[1], t[2])
            obb.orientation = mat3.create()
            obb.orientation = mat4.cut(obb.orientation, this.matrix, 3, 3)
            
            return obb
        }
    }

    get matrix() {
        this.updateMatrix();
        return this._matrix;
    }

    set originalMatrix(value) {
        this._originalMatrix = value
        this.updateMatrix()
    }

    get x() { return this._x; }
    set x(mValue) {
        this._needUpdate = true;
        this._x = mValue;
    }

    get y() { return this._y; }
    set y(mValue) {
        this._needUpdate = true;
        this._y = mValue;
    }

    get z() { return this._z; }
    set z(mValue) {
        this._needUpdate = true;
        this._z = mValue;
    }


    get scaleX() { return this._sx; }
    set scaleX(mValue) {
        this._needUpdate = true;
        this._sx = mValue;
    }

    get scaleY() { return this._sy; }
    set scaleY(mValue) {
        this._needUpdate = true;
        this._sy = mValue;
    }

    get scaleZ() { return this._sz; }
    set scaleZ(mValue) {
        this._needUpdate = true;
        this._sz = mValue;
    }

    set scale(mValue) {
        this._needUpdate = true;
        this._sx = mValue;
        this._sy = mValue;
        this._sz = mValue;
    }

    get rotationX() { return this._rx; }
    set rotationX(mValue) {
        this._needUpdate = true;
        this._rx = mValue;
    }

    get rotationY() { return this._ry; }
    set rotationY(mValue) {
        this._needUpdate = true;
        this._ry = mValue;
    }

    get rotationZ() { return this._rz; }
    set rotationZ(mValue) {
        this._needUpdate = true;
        this._rz = mValue;
    }


    get children() { return this._children; }

    set vertexMin(value) { this._vertexMin = value }

    set vertexMax(value) { this._vertexMax = value }

    get maxLength() {
        const maxSubMin = vec3.create()
        vec3.subtract(maxSubMin, this._vertexMax, this._vertexMin)
        return vec3.length(maxSubMin)
    }

    get hasScale() {
        
    }
}


export default Object3D;
