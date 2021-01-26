// GltfLoader.js

import xhr from './xhr';
import loadImages from './loadImages';
import Material from '../Material';
import Mesh from '../Mesh';
import { gltfVert, gltfFrag } from 'CustomShaders'


import GLTexture from '../GLTexture';
import Object3D from 'physics/Object3D';



const ARRAY_CTOR_MAP = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
};

const SIZE_MAP = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
};

const semanticAttributeMap = {
    NORMAL: 'normal',
    POSITION: 'position',
    'TANGENT': 'aTangent',
    TEXCOORD_0: 'texCoord',
    // TEXCOORD_1: 'aTextureCoord1',
    WEIGHTS_0: 'aWeight',
    JOINTS_0: 'aJoint',
    COLOR_0: 'color'
};

let base;

const load = (mSource) => new Promise((resolve, reject) => {
    if ((typeof mSource) === 'string') {
        base = mSource.substring(0, mSource.lastIndexOf('/') + 1);
    } else {
        base = '';
    }

    _loadGltf(mSource)
        .then(_loadBin)
        .then(_loadTextures)
        .then(_getBufferViewData)
        .then(_parseMaterials)
        .then(_parseMesh)
        .then(_parseNodes)
        .then(_parseAnimation)
        .then((gltfInfo) => {
            resolve(gltfInfo);
        })
        .catch(e => {
            console.log('Error:', e);
        });
});


const _parseNodes = (gltf) => new Promise((resolve, reject) => {
    const { nodes, scenes } = gltf;

    const getTree = (nodeIndex) => {
        const node = nodes[nodeIndex];


        const obj3D = node.mesh === undefined ? new Object3D() : gltf.output.meshes[node.mesh];
        obj3D.name = obj3D.name || node.name || ''


        if (node.scale) {
            obj3D.scaleX = node.scale[0];
            obj3D.scaleY = node.scale[1];
            obj3D.scaleZ = node.scale[2];
        }

        if (node.rotation) {
            obj3D.setRotationFromQuaternion(node.rotation);
        }

        if (node.translation) {
            obj3D.x = node.translation[0];
            obj3D.y = node.translation[1];
            obj3D.z = node.translation[2];
        }

        if (node.children) {
            node.children.forEach(child => {
                const _child = getTree(child);
                obj3D.addChild(_child);
            });
        }

        // we have to set children first, so set matrix can update parentMatrix
        if (node.matrix) {
            obj3D.originalMatrix = node.matrix
        }

        return obj3D;
    };

    gltf.output.scenes = scenes.map(scene => {
        const container = new Object3D();
        scene.nodes.forEach(nodeIndex => {
            const childTree = getTree(nodeIndex);
            container.addChild(childTree);
        });

        return container;
    });

    resolve(gltf);
});


const _parseMesh = (gltf) => new Promise((resolve, reject) => {
    const { meshes } = gltf;


    meshes.forEach(meshInfo => {
        const { primitives } = meshInfo;

        const geometryInfo = {};

        primitives.forEach(primitiveInfo => {
            const semantics = Object.keys(primitiveInfo.attributes);
            let defines = {};

            semantics.forEach(semantic => {
                const accessorIdx = primitiveInfo.attributes[semantic];
                const attributeInfo = gltf.accessors[accessorIdx];

                const attributeName = semanticAttributeMap[semantic];
                if (!attributeName) {
                    return;
                }
                if (semantic === 'NORMAL') {
                    defines.HAS_NORMALS = 1;
                }
                if (semantic.indexOf('COLOR') > -1) {
                    defines.HAS_COLOR = 1;
                }
                if (semantic.indexOf('TEXCOORD') > -1) {
                    defines.HAS_UV = 1;
                }


                const size = SIZE_MAP[attributeInfo.type];
                let attributeArray = _getAccessorData(gltf, accessorIdx);
                if (attributeArray instanceof Uint32Array) {
                    attributeArray = new Float32Array(attributeArray);
                }

                if (semantic === 'TEXCOORD_1') {
                    console.log(size, attributeArray);
                }
                if (semantic === 'POSITION') {
                    primitiveInfo.max = attributeInfo.max
                    primitiveInfo.min = attributeInfo.min
                }

                geometryInfo[attributeName] = {
                    value: attributeArray,
                    size,
                };
                // console.log('attribute', attributeName, geometryInfo[attributeName]);
            });

            //	parse index
            if (primitiveInfo.indices != null) {
                const attributeArray = _getAccessorData(gltf, primitiveInfo.indices, true);
                geometryInfo.indices = {
                    value: attributeArray,
                    size: 1
                };
            }

            const mesh = new Mesh(primitiveInfo.mode, meshInfo.name);
            mesh.vertexMin = primitiveInfo.min
            mesh.vertexMax = primitiveInfo.max

            for (const s in geometryInfo) {
                const data = geometryInfo[s];
                if (s !== 'indices') {
                    mesh.bufferFlattenData(data.value, s, data.size);

                } else {
                    mesh.bufferIndex(data.value);
                }
            }

            const materialInfo = gltf.output.materialInfo[primitiveInfo.material];
            defines = Object.assign(defines, materialInfo.defines);


            const {
                alphaCutoff,
                doubleSided,
                emissiveFactor,
                emissiveTexture,
                normalTexture,
                occlusionTexture,
                pbrMetallicRoughness,
            } = materialInfo;

            const {
                baseColorTexture,
                metallicRoughnessTexture
            } = pbrMetallicRoughness;

            const uniforms = {
                uAlphaCutoff: alphaCutoff || 0,
                uEmissiveFactor: emissiveFactor || [0, 0, 0],
                uBaseColor: pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1],
                uRoughness: pbrMetallicRoughness.roughnessFactor || 1,
                uMetallic: pbrMetallicRoughness.metallicFactor || 1,
                uScaleDiffBaseMR: [0, 0, 0, 0],
                uScaleFGDSpec: [0, 0, 0, 0],
                uScaleIBLAmbient: [1, 1, 1, 1],
                uLightDirection: [1, 1, 1],
                uLightColor: [1, 1, 1],
                uGamma: 1
            };

            if (baseColorTexture) {
                uniforms.uColorMap = baseColorTexture.glTexture;
            }

            if (metallicRoughnessTexture) {
                uniforms.uMetallicRoughnessMap = metallicRoughnessTexture.glTexture;
            }

            if (normalTexture) {
                uniforms.uNormalScale = normalTexture.scale || 1;
                uniforms.uNormalMap = normalTexture.glTexture;
            }

            if (occlusionTexture) {
                uniforms.uAoMap = occlusionTexture.glTexture;
                uniforms.uOcclusionStrength = occlusionTexture.strength || 1;
            }

            if (emissiveTexture) {
                uniforms.uEmissiveMap = emissiveTexture.glTexture
            }

            const material = new Material(gltfVert, gltfFrag, uniforms, defines, doubleSided)
            mesh.setMaterial(material)
            gltf.output.meshes.push(mesh);
        });
    });

    resolve(gltf);
});

const _getBufferViewData = (gltfInfo) => new Promise((resolve, reject) => {
    const { bufferViews, buffers } = gltfInfo;

    bufferViews.forEach((bufferViewInfo, i) => {
        const buffer = buffers[bufferViewInfo.buffer].data;
        bufferViewInfo.data = buffer.slice(bufferViewInfo.byteOffset || 0, (bufferViewInfo.byteOffset || 0) + (bufferViewInfo.byteLength || 0));
    });
    resolve(gltfInfo);
});

const _loadGltf = (mSource) => new Promise((resolve, reject) => {
    if ((typeof mSource) !== 'string') {
        resolve(mSource);
    } else {
        xhr(mSource).then((o) => {
            const gltfInfo = JSON.parse(o);
            gltfInfo.output = {
                meshes: [],
                scenes: [],
                textures: [],
                material: [],
                materialInfo: []
            };

            resolve(gltfInfo);
        }, (e) => {
            reject(e);
        });
    }
});


const _loadBin = (gltfInfo) => new Promise((resolve, reject) => {

    if (gltfInfo.buffers) {
        let count = gltfInfo.buffers.length;

        gltfInfo.buffers.forEach(buffer => {

            const urlBin = `${base}${gltfInfo.buffers[0].uri}`;
            xhr(urlBin, true).then((o) => {
                buffer.data = o;

                count--;
                if (count === 0) {
                    resolve(gltfInfo);
                }

            }, e => {
                reject(e);
            });
        });

    } else {
        resolve(gltfInfo);
    }

});

const _loadTextures = (gltfInfo) => new Promise((resolve, reject) => {
    const { textures, images, samplers } = gltfInfo;
    if (!images) {
        resolve(gltfInfo);
        return
    }

    const imagesToLoad = images.map(img => `${base}${img.uri}`);

    loadImages(imagesToLoad).then((o) => {
        gltfInfo.output.textures = o.map((img, i) => {
            const settings = Object.assign({}, samplers ? samplers[textures[i].sampler] : {});
            return new GLTexture(img, settings);
        });
        resolve(gltfInfo);
    }, (e) => {
        reject(e);
    });
});

const _parseMaterials = (gltfInfo) => new Promise((resolve, reject) => {
    const { materials } = gltfInfo;
    const { textures } = gltfInfo.output;


    gltfInfo.output.materialInfo = materials.map(material => {
        material.defines = {
            USE_IBL: 1,
            ALPHA_MASK: material.alphaMode == 'MASK' ? 1 : 0
        };

        if (material.normalTexture) {
            material.defines.HAS_NORMALMAP = 1;
            material.normalTexture.glTexture = textures[material.normalTexture.index];
        }

        if (material.occlusionTexture) {
            material.defines.HAS_OCCLUSIONMAP = 1;
            material.occlusionTexture.glTexture = textures[material.occlusionTexture.index];
        }

        if (material.emissiveTexture) {
            material.defines.HAS_EMISSIVEMAP = 1;
            material.emissiveTexture.glTexture = textures[material.emissiveTexture.index];
        }

        // if(material.pbrMetallicRoughness) {
        if (material.pbrMetallicRoughness.baseColorTexture) {
            material.defines.HAS_BASECOLORMAP = 1;
            material.pbrMetallicRoughness.baseColorTexture.glTexture = textures[material.pbrMetallicRoughness.baseColorTexture.index];
        }

        if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
            material.defines.HAS_METALROUGHNESSMAP = 1;
            material.pbrMetallicRoughness.metallicRoughnessTexture.glTexture = textures[material.pbrMetallicRoughness.metallicRoughnessTexture.index];
        }

        // }

        return material;
    });


    resolve(gltfInfo);
});

//renderedPrimitive.POSITION = primitive.POSITION + weights[0] * primitive.targets[0].POSITION +weights[1] * primitive.targets[1].POSITION;
const _parseAnimation = (gltfInfo) => new Promise((resolve, reject) => {
    const { nodes, animations } = gltfInfo
    const meshesInfo = gltfInfo.meshes
    const { meshes } = gltfInfo.output

    if(!animations) {
        resolve(gltfInfo)
        return
    }

    animations.forEach(animation => {
        const { samplers } = animation
        animation.channels.forEach(channel => {
            const { node, path } = channel.target
            const meshIndex = nodes[node].mesh
            const meshInfo = meshesInfo[meshIndex]
            const mesh = meshes[meshIndex]
            const sampler = samplers[channel.sampler]
            const { input, output, interpolation } = sampler
            const time = _getAccessorData(gltfInfo, input)
            const transform = _getAccessorData(gltfInfo, output)
            
            if(path === 'weights') { // morph target
                const weights = []
                const targetPos = []
                const { primitives } = meshInfo
                
                const weightLength = meshInfo.weights.length
                for(let i = 0; i < transform.length / weightLength; i++) {
                    const weight = []
                    for(let j = 0 ;j < weightLength; j++){
                        weight.push(transform[i * weightLength + j])
                    }
                    weights.push(weight)
                }

                const { targets } = primitives[meshIndex]
                
                targets.forEach(v => {
                    const typedPos = _getAccessorData(gltfInfo, v.POSITION)
                    targetPos.push(mesh.formBuffer(typedPos, 3))
                })
                const deepclone = (items) => items.map(item => Array.isArray(item) ? deepclone(item) : item);
                const originalPos = deepclone(mesh.vertices)

                mesh.animate = _morphTarget(mesh, originalPos, targetPos, weights, time, interpolation)
            }
        })
    })

    resolve(gltfInfo);
})

// linear
const _morphTarget = (mesh, originalPos, targetPos, weights, time, interpolation) => {
    
    return function anim() {

        //caculate wights from time
        if(!mesh.startTime) mesh.startTime = performance.now()

        const timeSecond = time[time.length - 1] - time[0]
        const pastSecond = (performance.now() - mesh.startTime) / 1000 * mesh.animateSpeed
        const fractTime = pastSecond % timeSecond
        const weightCurrent = []
        for(let k = 0; k < time.length; k++) {
            
            if(fractTime <= time[k]) {
                if(interpolation == 'LINEAR') {
                    const percent = (fractTime - time[k-1]) / (time[k] - time[k-1])
                    for(let j = 0; j < weights[0].length; j++) {
                        const change = weights[k][j]- ( k == 0 ? 0 : weights[k-1][j])
                        if(change === 0) {
                            weightCurrent[j] = weights[k][j]
                        } else {
                            weightCurrent[j] = percent  * change + weights[k-1][j]
                        }
                    }
                }
                break;
            }
                
        }

        const newPos = mesh.vertices.map((v,j) => {
            const move = [0, 0 ,0]
            for(let i = 0 ;i < weightCurrent.length; i++){
                if(weightCurrent[i] !== 0){
                    move[0] += weightCurrent[i] * targetPos[i][j][0]
                    move[1] += weightCurrent[i] * targetPos[i][j][1]
                    move[2] += weightCurrent[i] * targetPos[i][j][2]
                }
            }
            vec3.add(v, originalPos[j], move)
            return v 
        })
        mesh.bufferVertex(newPos)

    }
}

const parse = (mGltfInfo, mBin) => new Promise((resolve, reject) => {
    resolve(mSource);
});


const _getAccessorData = (gltf, accessorIdx, isIndices = false) => {
    const accessorInfo = gltf.accessors[accessorIdx];
    const buffer = gltf.bufferViews[accessorInfo.bufferView].data;
    const byteOffset = accessorInfo.byteOffset || 0;
    const ArrayCtor = ARRAY_CTOR_MAP[accessorInfo.componentType] || Float32Array;
    let size = SIZE_MAP[accessorInfo.type];
    if (size == null && isIndices) {
        size = 1;
    }
    let arr = new ArrayCtor(buffer, byteOffset, size * accessorInfo.count);
    const quantizeExtension = accessorInfo.extensions && accessorInfo.extensions['WEB3D_quantized_attributes'];
    if (quantizeExtension) {
        const decodedArr = new Float32Array(size * accessorInfo.count);
        const decodeMatrix = quantizeExtension.decodeMatrix;
        const decodeOffset = new Array(size);
        const decodeScale = new Array(size);
        for (let k = 0; k < size; k++) {
            decodeOffset[k] = decodeMatrix[size * (size + 1) + k];
            decodeScale[k] = decodeMatrix[k * (size + 1) + k];
        }
        for (let i = 0; i < accessorInfo.count; i++) {
            for (let k = 0; k < size; k++) {
                decodedArr[i * size + k] = arr[i * size + k] * decodeScale[k] + decodeOffset[k];
            }
        }

        arr = decodedArr;
    }

    // console.log({buffer, byteOffset, ArrayCtor, size, arr});

    return arr;
};

export default {
    load,
    parse
};
