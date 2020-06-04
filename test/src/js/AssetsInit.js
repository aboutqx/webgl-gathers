import GLTexture from 'libs/GLTexture'
import GLCubeTexture from 'libs/GLCubeTexture'
import HDRParser from 'loaders/HDRParser'
import ObjLoader from 'loaders/ObjLoader'
import GLTFLoader from 'loaders/GLTFLoader'

const getExtension = function (mFile) {
    const ary = mFile.split('.');
    return ary[ary.length - 1];
}

export default async function AssetsInit(assets, files) {
    let hdrCubemaps = {}
    let result = {}
    let texture
    let t, cubemapName, jpgCubemaps = {}
    for (let name in assets) {
        let url = assets[name].url || assets[name]
        let file = files[name]
        const ext = getExtension(url)
        switch (ext) {
            case 'jpg':
                if (url.split('_').length <= 2) {
                    texture = new GLTexture(file);
                    result[name] = texture
                    break;
                }
                t = url.split('_')[0].split('/')
                cubemapName = t[t.length - 1] + (url.split('_').length > 2 ? url.split('_')[1] : '')


                if (!jpgCubemaps[cubemapName]) {
                    jpgCubemaps[cubemapName] = [];
                }

                jpgCubemaps[cubemapName].push(file);

                result[name] = file
                break;
            case 'png':
                texture = new GLTexture(file);
                result[name] = texture
                break;

            case 'hdr':
                if (url.split('_').length <= 2) {
                    texture = new GLTexture(file);
                    result[name] = texture
                    break;
                }
                t = url.split('_')[0].split('/')
                cubemapName = t[t.length - 1] + (url.split('_').length > 2 ? url.split('_')[1] : '')
                texture = HDRParser(file);

                if (!hdrCubemaps[cubemapName]) {
                    hdrCubemaps[cubemapName] = [];
                }

                hdrCubemaps[cubemapName].push(texture);

                result[name] = texture
                break;
            case 'dds':
                texture = GLCubeTexture.parseDDS(file);
                result[name] = texture
                break;

            case 'obj':
                const mesh = ObjLoader.parse(file);
                result[name] = mesh
                break;
            case 'gltf':
                result[name] = { gltfInfo : await GLTFLoader.load(url) }
                break;
            default:
                result[name] = file
                break
        }
    }
    generateCubeMap(hdrCubemaps, result)
    generateCubeMap(jpgCubemaps, result)


    // console.debug('ASSETS:');
    // console.table(result);

    return result
}

const generateCubeMap = (v, result) => {
    for (let s in v) {
        if (v[s].length == 6) {

            const ary = [
                result[`${s}PosX`],
                result[`${s}NegX`],
                result[`${s}PosY`],
                result[`${s}NegY`],
                result[`${s}PosZ`],
                result[`${s}NegZ`]
            ];

            const texture = new GLCubeTexture(ary);
            result[s] = texture
        }
    }
}
