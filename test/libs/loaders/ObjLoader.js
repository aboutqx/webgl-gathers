// ObjLoader.js
// from https: //github.com/yiwenl/alfrid
'use strict';
import xhr from './xhr';
import Mesh from '../Mesh';

class ObjLoader {
  object = null
  objectList = []
  meshes = []
  materialLibraries = []
  load(url, resolve, reject, drawType = 4) {
    this._drawType = drawType;
    xhr(url).then((o)=>{

			resolve(o)
		}, (e)=> {
			reject(e);
		});
  }

  _onLoaded() {
    this.parseObj(this._req.response);
  }

  parseObj(objStr, materials) {
    this.materials = materials
    const lines = objStr.split('\n');
    // 实际buffer的数据
    const positions = [];
    const coords = [];
    const finalNormals = [];
    const indices = [];

    // add face 调用，把暂时的vertices，normals，uvs根据解析来的indices填充到实际buffer的数据里,
    const vertices = [];
    const normals = [];
    const uvs = [];

    let result;

    // o object_name | g group_name
    //ignore mtl
    const objectPattern = /^[og]\s*(.+)?/;
    	// mtllib file_reference
    const material_library_pattern = /^mtllib /;
    // usemtl material_name
    const material_use_pattern = /^usemtl /;
    // v float float float
    const vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vn float float float
    const normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vt float float
    const uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // f vertex vertex vertex ...
    const facePattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

    // f vertex/uv vertex/uv vertex/uv ...
    const facePattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
    const facePattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

    // f vertex//normal vertex//normal vertex//normal ...
    const facePattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;


    function parseVertexIndex(value) {
      const index = parseInt(value);
      return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
    }

    function parseNormalIndex(value) {
      const index = parseInt(value);
      return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
    }

    function parseUVIndex(value) {
      const index = parseInt(value);
      return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
    }


    const addVertex = (a, b, c) => {
      // 1个face 3个index a,b,c,顶点是依次输入的，所以没用重用，index是连续的，没有重用
      this.object.positions.push([vertices[a], vertices[a + 1], vertices[a + 2]]);
      this.object.positions.push([vertices[b], vertices[b + 1], vertices[b + 2]]);
      this.object.positions.push([vertices[c], vertices[c + 1], vertices[c + 2]]);

      this.object.indices.push(this.object.count * 3 + 0);
      this.object.indices.push(this.object.count * 3 + 1);
      this.object.indices.push(this.object.count * 3 + 2);

      this.object.count++;

    }


    const addUV = (a, b, c) => {
      this.object.coords.push([uvs[a], uvs[a + 1]]);
      this.object.coords.push([uvs[b], uvs[b + 1]]);
      this.object.coords.push([uvs[c], uvs[c + 1]]);
    }


    const addNormal = (a, b, c) => {
      this.object.finalNormals.push([normals[a], normals[a + 1], normals[a + 2]]);
      this.object.finalNormals.push([normals[b], normals[b + 1], normals[b + 2]]);
      this.object.finalNormals.push([normals[c], normals[c + 1], normals[c + 2]]);
    }

    // 定义之前vertex lists里的相关索引，vertex indices,uv indices,normal indices etc.
    // 使用整个obj文件的顶点为索引，即不区分是哪个对象，f从1开始，直到全部对象顶点的结尾
    // 实际buffer数据在此添加
    function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
      let ia = parseVertexIndex(a);
      let ib = parseVertexIndex(b);
      let ic = parseVertexIndex(c);
      let id;

      if (d === undefined) {

        addVertex(ia, ib, ic);

      } else {

        id = parseVertexIndex(d);

        addVertex(ia, ib, id);
        addVertex(ib, ic, id);

      }


      if (ua !== undefined) {

        ia = parseUVIndex(ua);
        ib = parseUVIndex(ub);
        ic = parseUVIndex(uc);

        if (d === undefined) {

          addUV(ia, ib, ic);

        } else {

          id = parseUVIndex(ud);

          addUV(ia, ib, id);
          addUV(ib, ic, id);

        }

      }

      if (na !== undefined) {

        ia = parseNormalIndex(na);
        ib = parseNormalIndex(nb);
        ic = parseNormalIndex(nc);

        if (d === undefined) {

          addNormal(ia, ib, ic);

        } else {

          id = parseNormalIndex(nd);

          addNormal(ia, ib, id);
          addNormal(ib, ic, id);

        }

      }
    }


    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      line = line.trim();

      if (line.length === 0 || line.charAt(0) === '#') {

        continue;

      }
      let lineFirstChar = line.charAt(0)
      if (material_library_pattern.test(line)) {

        // mtl file

        this.materialLibraries.push(line.substring(7).trim());

      } else if (material_use_pattern.test(line)) {

        this._startMaterial(line.substring(7).trim(), this.materialLibraries)

      } else if ((result = objectPattern.exec(line)) !== null) {
        // o object_name
        // or
        // g group_name

        // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
        // var name = result[ 0 ].substr( 1 ).trim();
        let name = (" " + result[0].substr(1).trim()).substr(1)

        this._startObject(name);
      } else if ((result = vertexPattern.exec(line)) !== null) {

        vertices.push(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        );

      } else if ((result = normalPattern.exec(line)) !== null) {

        normals.push(
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3])
        );

      } else if ((result = uvPattern.exec(line)) !== null) {

        uvs.push(
          parseFloat(result[1]),
          parseFloat(result[2])
        );

      } else if ((result = facePattern1.exec(line)) !== null) {

        addFace(
          result[1], result[2], result[3], result[4]
        );

      } else if ((result = facePattern2.exec(line)) !== null) {

        addFace(
          result[2], result[5], result[8], result[11],
          result[3], result[6], result[9], result[12]
        );

      } else if ((result = facePattern3.exec(line)) !== null) {
        addFace(
          result[2], result[6], result[10], result[14],
          result[3], result[7], result[11], result[15],
          result[4], result[8], result[12], result[16]
        );

      } else if ((result = facePattern4.exec(line)) !== null) {
        addFace(
          result[2], result[5], result[8], result[11],
          undefined, undefined, undefined, undefined,
          result[3], result[6], result[9], result[12]
        );

      }
    }

    return this._generateMeshes();

  }

  _startObject (name) {
    if(has(this.objectList, 'name', name) !== -1) return
    // console.log('start object', name)
    this.object = {
      name,
      positions: [],
      coords: [],
      finalNormals: [],
      indices: [],
      count: 0 // index
    }

    this.objectList.push(this.object)
  }

  _startMaterial (name, lib) {
    let material = {
      name,
      mtlLib: lib[lib.length - 1]
    }

    this.object.material = material
  }

  _generateMeshes() {
    let o
    for(let i = 0; i < this.objectList.length; i++){
      o = {
        positions: this.objectList[i].positions,
        coords: this.objectList[i].coords,
        indices: this.objectList[i].indices,
        normals: this.objectList[i].finalNormals,
        name: this.objectList[i].name,
        material: this.materials ? { ...this.materials[this.objectList[i].material.name],
          mtlLib: this.objectList[i].material.mtlLib } : this.objectList[i].material
          
      }

      const hasNormals = o.normals.length > 0
      const hasUVs = o.coords.length > 0
      let mesh = new Mesh(this._drawType, o.name, o.material)
      mesh.bufferVertex(o.positions);
      if (hasUVs) {
        mesh.bufferTexCoord(o.coords);
      }
      mesh.bufferIndex(o.indices);
      if (hasNormals) {
        mesh.bufferNormal(o.normals);
      }

      if (this._callback) {
        this._callback(mesh, o);
      }
      this.meshes.push(mesh)
    }
    return this.meshes
  }

}


ObjLoader.parse = function (objStr, mtl) {
  const loader = new ObjLoader();
  return loader.parseObj(objStr, mtl);
};
function has(arr, key, value) { // array child object has key-value
  if (!arr || !arr.length) return -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) return i
  }
  return -1
}

export default ObjLoader;