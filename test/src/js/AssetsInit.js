import GLTexture from 'libs/GLTexture2'
import GLCubeTexture from 'libs/GLCubeTexture'
import HDRParser from 'loaders/HDRParser'
import ObjLoader from 'loaders/ObjLoader'

const getExtension = function(mFile) {
	const ary = mFile.split('.');
	return ary[ary.length - 1];
}

export default function AssetsInit(assets, files){
    let hdrCubemaps = {}
    let result = {}
    let texture
    for(let name in assets){
        let url = assets[name].url || assets[name]
        let file = files[name]
        const ext = getExtension(url)
        switch(ext) {
            case 'jpg':
                // let t = url.split('_')[0].split('/') 
                // let cubemapName =  t[t.length-1]  + (url.split('_').length >2 ? url.split('_')[1] : '')
                // texture = HDRParser(file);
    
                // if(!hdrCubemaps[cubemapName]) {
                //     hdrCubemaps[cubemapName] = [];
                // }
    
                // hdrCubemaps[cubemapName].push(texture);

                // result[name] = texture
                // break;
            case 'png':
                texture = new GLTexture(file);
                result[name] = texture
                break;
    
            case 'hdr':
                let t = url.split('_')[0].split('/') 
                let cubemapName =  t[t.length-1]  + (url.split('_').length >2 ? url.split('_')[1] : '')
                texture = HDRParser(file);
    
                if(!hdrCubemaps[cubemapName]) {
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
            default:
                result[name] = file
                break
        }
    }
    for(let s in hdrCubemaps) {
		if(hdrCubemaps[s].length == 6) {

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
    
    
    console.debug('ASSETS:');
    console.table(result);	
	
    return result
}